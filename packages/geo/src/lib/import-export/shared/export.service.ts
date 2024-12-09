import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EntityRecord } from '@igo2/common/entity';
import { Workspace, WorkspaceStore } from '@igo2/common/workspace';
import { ConfigService } from '@igo2/core/config';
import {
  addExcelSheetToWorkBook,
  createExcelWorkBook,
  downloadBlob,
  downloadContent,
  isIsoDate,
  writeExcelFile
} from '@igo2/utils';

import OlFeature from 'ol/Feature';
import * as olformat from 'ol/format';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { circular } from 'ol/geom/Polygon';

import { FeatureCollection } from 'geojson';
import { Observable, Observer, catchError, lastValueFrom, of, tap } from 'rxjs';

import { ClusterDataSource, WFSDataSource } from '../../datasource';
import { Feature } from '../../feature';
import { AnyLayer, VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import {
  EditionWorkspace,
  FeatureWorkspace,
  WfsWorkspace
} from '../../workspace';
import {
  ExportInvalidFileError,
  ExportNothingToExportError
} from './export.errors';
import { ExportOptions, GeometryCollection } from './export.interface';
import { AnyExportFormat, ExportOgreFormat } from './export.type';
import { isCsvExport } from './export.utils';

const SHAPEFILE_FIELD_MAX_LENGHT = 255;

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  static ogreFormats: Record<ExportOgreFormat, string> = {
    GML: 'gml',
    GPX: 'gpx',
    KML: 'kml',
    Shapefile: 'ESRI Shapefile',
    CSV: 'CSV',
    /** @deprecated use CSV */
    CSVcomma: 'CSVcomma',
    /** @deprecated use CSV */
    CSVsemicolon: 'CSVsemicolon'
  };

  static noOgreFallbacks: Partial<AnyExportFormat[]> = ['GML', 'GPX', 'KML'];

  private ogreUrl: string;
  private aggregateInComment = true;

  constructor(
    private config: ConfigService,
    private httpClient: HttpClient
  ) {
    this.ogreUrl = this.config.getConfig('importExport.url');
    const gpxAggregateInComment = this.config.getConfig(
      'importExport.gpxAggregateInComment'
    );
    if (gpxAggregateInComment !== undefined) {
      this.aggregateInComment = gpxAggregateInComment;
    }
  }

  export(
    olFeatures: OlFeature<OlGeometry>[],
    options: ExportOptions,
    title: string,
    projectionIn = 'EPSG:4326',
    projectionOut = 'EPSG:4326'
  ): Observable<void> {
    const exportOlFeatures = this.cleanFeatures(
      olFeatures,
      options.format,
      '_featureStore'
    );

    return this.exportAsync(
      exportOlFeatures,
      options,
      title,
      projectionIn,
      projectionOut
    );
  }

  public cleanFeatures(
    olFeatures: OlFeature<OlGeometry>[],
    format: AnyExportFormat,
    excludePrefix = '_'
  ): OlFeature<OlGeometry>[] {
    if (format === 'GPX' && this.aggregateInComment) {
      return this.generateAggregatedFeature(olFeatures);
    }

    return olFeatures.map((olFeature: OlFeature<OlGeometry>) => {
      let keys = olFeature
        .getKeys()
        .filter((key: string) => !key.startsWith(excludePrefix));

      if (format === 'Shapefile' && olFeature.get('_style')) {
        const style = JSON.stringify(olFeature.get('_style'));
        if (style.length > SHAPEFILE_FIELD_MAX_LENGHT)
          keys = keys.filter((key) => key !== '_style');
      }

      const properties = keys.reduce(
        (acc: object, key: string) => {
          acc[key] = olFeature.get(key);
          return acc;
        },
        { geometry: olFeature.getGeometry() }
      );
      return new OlFeature(properties);
    });
  }

  private generateAggregatedFeature(
    olFeatures: OlFeature<OlGeometry>[]
  ): OlFeature<OlGeometry>[] {
    return olFeatures.map((olFeature: OlFeature<OlGeometry>) => {
      const keys = olFeature
        .getKeys()
        .filter((key: string) => !key.startsWith('_'));
      let comment = '';
      const properties = keys.reduce(
        (acc: object, key: string) => {
          if (key && key !== 'geometry') {
            key === 'id' && olFeature.get('draw')
              ? (comment += key + ':' + olFeature.get('draw') + '   \r\n')
              : (comment += key + ':' + olFeature.get(key) + '   \r\n');
          }
          acc[key] = olFeature.get(key);
          return acc;
        },
        {
          geometry: olFeature.getGeometry()
        }
      );
      const newFeature = new OlFeature(properties);
      newFeature.set('name', olFeature.getId());
      newFeature.set('cmt', comment);

      return newFeature;
    });
  }

  private exportAsync(
    olFeatures: OlFeature<OlGeometry>[],
    options: ExportOptions,
    title: string,
    projectionIn: string,
    projectionOut: string
  ): Observable<void> {
    const { format } = options;
    return new Observable((observer: Observer<void>) => {
      const nothingToExport = this.nothingToExport(olFeatures, format);
      if (nothingToExport) {
        observer.error(new ExportNothingToExportError());
        return;
      }

      const ogreFormats = Object.keys(ExportService.ogreFormats);
      if (ogreFormats.indexOf(format) >= 0) {
        if (!this.ogreUrl) {
          if (ExportService.noOgreFallbacks.indexOf(format) >= 0) {
            this.exportToFile(
              olFeatures,
              format,
              title,
              projectionIn,
              projectionOut
            );
            observer.complete();
          } else {
            observer.error(new ExportInvalidFileError());
          }
          return;
        }
        this.exportWithOgre(
          olFeatures,
          options,
          title,
          projectionIn,
          projectionOut
        ).subscribe({
          complete: () => observer.complete(),
          error: (error) => observer.error(error)
        });
      } else {
        this.exportToFile(
          olFeatures,
          format,
          title,
          projectionIn,
          projectionOut
        );
        observer.complete();
      }
    });
  }

  protected async exportToFile(
    olFeatures: OlFeature<OlGeometry>[],
    format: AnyExportFormat,
    title: string,
    projectionIn: string,
    projectionOut: string
  ) {
    const features = this.formatFeatures(
      olFeatures,
      format,
      projectionIn,
      projectionOut
    );

    const fileName = `${title}.${format.toLowerCase()}`;
    downloadContent(features, 'attachment/plain;charset=utf-8', fileName);
  }

  private formatFeatures(
    features: OlFeature<OlGeometry>[],
    format: AnyExportFormat,
    projectionIn = 'EPSG:4326',
    projectionOut = 'EPSG:4326'
  ) {
    const formatter = this.getFormatter(format);
    const cleanFeatures = this.cleanFeatures(features, format, '_featureStore');
    return formatter.writeFeatures(cleanFeatures, {
      dataProjection: projectionOut,
      featureProjection: projectionIn
    });
  }

  getFormatter(format: AnyExportFormat) {
    switch (format) {
      case 'GPX':
        return new olformat.GPX();
      case 'GML':
        return new olformat.GML();
      case 'KML':
        return new olformat.KML();
      default:
        return new olformat.GeoJSON();
    }
  }

  async exportExcel(map: IgoMap, store: WorkspaceStore, data: ExportOptions) {
    const workbook = await createExcelWorkBook();

    for (const layerName of data.layers) {
      const layer = map.getLayerById(layerName);
      const features = await lastValueFrom(
        this.getFeatures(map, layer, data, store)
      );

      const formattedFeatures = features?.length
        ? this.formatFeatures(features, 'GeoJSON')
        : null;

      const collection: FeatureCollection = features
        ? JSON.parse(formattedFeatures)
        : {
            features: []
          };
      const rows = collection.features.map((feature) =>
        this.formatRecord(feature.properties)
      );

      await addExcelSheetToWorkBook(layer.title, rows, workbook);
    }

    const title = this.getTitleFromLayers(data.layers, map);
    writeExcelFile(workbook, title, { compression: true });
  }

  private getTitleFromLayers(layers: string[], map: IgoMap): string {
    return layers.length === 1
      ? this.getLayerTitleFromId(layers[0], map)
      : 'igo';
  }

  private getLayerTitleFromId(id: string, map: IgoMap): string {
    const layer = map.getLayerById(id);
    return layer.title;
  }

  private formatRecord(
    record: Record<string, unknown>
  ): Record<string, unknown> {
    return Object.entries(record).reduce((formatted, [key, value]) => {
      formatted[key] = this.formatDataType(value);
      return formatted;
    }, {});
  }

  private formatDataType(value: unknown): unknown {
    switch (true) {
      case typeof value === 'string': {
        if (isIsoDate(value as string)) {
          return new Date(value as string).toLocaleString();
        }

        return value;
      }
      case typeof value === 'object':
      case value instanceof Array: {
        return JSON.stringify(value);
      }
      default:
        return value;
    }
  }

  private exportWithOgre(
    olFeatures: OlFeature<OlGeometry>[],
    { format, csvSeparator = null }: ExportOptions,
    title: string,
    projectionIn: string,
    projectionOut: string
  ) {
    const featuresText = new olformat.GeoJSON().writeFeatures(olFeatures, {
      dataProjection: projectionOut,
      featureProjection: projectionIn
    });
    const url = `${this.ogreUrl}/convertJson`;

    const formData = new FormData();

    formData.append('json', featuresText);

    let outputName =
      format === 'Shapefile'
        ? `${title}.zip`
        : `${title}.${format.toLowerCase()}`;
    let ogreFormat = ExportService.ogreFormats[format];

    if (isCsvExport(format)) {
      outputName = `${title}.csv`;

      if (format === 'CSVcomma' || format === 'CSVsemicolon') {
        ogreFormat = 'CSV';
      }

      formData.append('lco', `SEPARATOR=${csvSeparator}`);

      if (format === 'CSVsemicolon') {
        formData.append('lco', `SEPARATOR=${csvSeparator}`);
      }
    }

    formData.append('outputName', this.formatFilename(outputName));
    formData.append('format', ogreFormat);

    return this.httpClient
      .post(url, formData, {
        responseType: 'blob'
      })
      .pipe(
        tap((value) => {
          downloadBlob(value, outputName);
        })
      );
  }

  private formatFilename(name: string): string {
    return name
      .replaceAll(' ', '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/’/g, "'");
  }

  private nothingToExport(
    olFeatures: OlFeature<OlGeometry>[],
    format: string
  ): boolean {
    if (olFeatures.length === 0) {
      return true;
    }
    if (format === 'GPX') {
      const pointOrLine = olFeatures.find((olFeature) => {
        return (
          ['Point', 'LineString', 'MultiLineString'].indexOf(
            olFeature.getGeometry().getType()
          ) >= 0
        );
      });
      return pointOrLine === undefined;
    }
    return false;
  }

  private getFeaturesFromMap(
    layer: VectorLayer,
    options: ExportOptions
  ): OlFeature[] {
    const dataSource = layer.dataSource.ol;
    const extent = layer.map.viewController.getExtent();

    let features: OlFeature[] = options.featureInMapExtent
      ? dataSource.getFeaturesInExtent(extent)
      : dataSource.getFeatures();

    if (layer.dataSource instanceof ClusterDataSource) {
      features = features.flatMap((cluster) => cluster.get('features'));
    }
    return features;
  }

  private getFeaturesFromWorkspace(
    wks: Workspace,
    layerName: string,
    data: ExportOptions
  ): OlFeature[] {
    const hasSelection = data.layersWithSelection.indexOf(layerName) !== -1;
    const isInMapExtent = data.featureInMapExtent;
    if (hasSelection && isInMapExtent) {
      // Only export selected feature && into map extent
      return wks.entityStore.stateView
        .all()
        .filter(
          (e: EntityRecord<object>) => e.state.inMapExtent && e.state.selected
        )
        .map((e) => (e.entity as Feature).ol as OlFeature);
    } else if (hasSelection && !isInMapExtent) {
      // Only export selected feature &&  (into map extent OR not)
      return wks.entityStore.stateView
        .all()
        .filter((e: EntityRecord<object>) => e.state.selected)
        .map((e) => (e.entity as Feature).ol as OlFeature);
    } else if (isInMapExtent) {
      // Only into map extent
      return wks.entityStore.stateView
        .all()
        .filter((e: EntityRecord<object>) => e.state.inMapExtent)
        .map((e) => (e.entity as Feature).ol as OlFeature);
    } else {
      // All features
      return wks.entityStore.stateView
        .all()
        .map((e) => (e.entity as Feature).ol as OlFeature);
    }
  }

  getFeatures(
    map: IgoMap,
    layer: AnyLayer,
    data: ExportOptions,
    store: WorkspaceStore
  ): Observable<OlFeature[]> {
    const projection = map.viewController.getOlProjection();
    const extent = data.featureInMapExtent
      ? map.viewController.getExtent()
      : undefined;

    if (layer.dataSource instanceof WFSDataSource) {
      return layer.dataSource
        .fetchFeatures({
          extent,
          projection,
          httpClient: this.httpClient
        })
        .pipe(
          catchError((e) => {
            throw e;
          })
        );
    }
    // Filter spatial use external API to make query and use Workspace to store data
    else if (layer.options.workspace?.enabled) {
      const wks = this.getWorkspaceByLayerId(layer.id, store);
      if (wks?.entityStore?.stateView.all().length) {
        const features = this.getFeaturesFromWorkspace(wks, layer.id, data);
        return of(features).pipe(
          catchError((e) => {
            throw e;
          })
        );
      }
    } else if (layer instanceof VectorLayer) {
      return of(this.getFeaturesFromMap(layer, data));
    }

    return of([]);
  }

  getWorkspaceByLayerId(id: string, store: WorkspaceStore): Workspace {
    const wksFromLayerId = store
      .all()
      .find(
        (workspace) =>
          (workspace as WfsWorkspace | FeatureWorkspace | EditionWorkspace)
            .layer.id === id
      );
    if (wksFromLayerId) {
      return wksFromLayerId;
    }
    return;
  }

  getGeomTypes(
    features: OlFeature[],
    format?: AnyExportFormat
  ): GeometryCollection[] {
    let geomTypes: GeometryCollection[] = [];
    if (format === 'Shapefile' || format === 'GPX') {
      features.forEach((olFeature) => {
        const featureGeomType = olFeature.getGeometry().getType();
        const currentGeomType = geomTypes.find(
          (geomType) => geomType.type === featureGeomType
        );
        if (currentGeomType) {
          currentGeomType.features.push(olFeature);
        } else {
          geomTypes.push({
            type: featureGeomType,
            features: [olFeature]
          });
        }
      });
    } else {
      geomTypes = [{ type: null, features: features }];
    }

    geomTypes.forEach((geomType) => {
      geomType.features.forEach((feature) => {
        const radius: number = feature.get('rad');
        if (radius) {
          const center4326: number[] = [
            feature.get('longitude'),
            feature.get('latitude')
          ];
          const circle = circular(center4326, radius, 500);
          circle.transform('EPSG:4326', feature.get('_projection'));
          feature.setGeometry(circle);
        }
      });
    });

    return geomTypes;
  }
}
