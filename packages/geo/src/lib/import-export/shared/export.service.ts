import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { downloadContent } from '@igo2/utils';

import OlFeature from 'ol/Feature';
import * as olformat from 'ol/format';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { Observable, Observer } from 'rxjs';
import { encode } from 'windows-1252';

import {
  ExportInvalidFileError,
  ExportNothingToExportError
} from './export.errors';
import { EncodingFormat, ExportFormat } from './export.type';

const SHAPEFILE_FIELD_MAX_LENGHT = 255;

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  static ogreFormats = {
    GML: 'gml',
    GPX: 'gpx',
    KML: 'kml',
    Shapefile: 'ESRI Shapefile',
    CSVcomma: 'CSVcomma',
    CSVsemicolon: 'CSVsemicolon'
  };

  static noOgreFallbacks = ['GML', 'GPX', 'KML'];

  private ogreUrl: string;
  private aggregateInComment: boolean = true;

  private ShapefileMaxLength: number = 255;

  constructor(private config: ConfigService) {
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
    format: ExportFormat,
    title: string,
    encoding: EncodingFormat,
    projectionIn = 'EPSG:4326',
    projectionOut = 'EPSG:4326'
  ): Observable<void> {
    const exportOlFeatures = this.generateFeature(
      olFeatures,
      format,
      '_featureStore'
    );

    return this.exportAsync(
      exportOlFeatures,
      format,
      title,
      encoding,
      projectionIn,
      projectionOut
    );
  }

  public generateFeature(
    olFeatures: OlFeature<OlGeometry>[],
    format: ExportFormat,
    excludePrefix: string = '_'
  ): OlFeature<OlGeometry>[] {
    if (format === ExportFormat.GPX && this.aggregateInComment) {
      return this.generateAggregatedFeature(olFeatures);
    }

    return olFeatures.map((olFeature: OlFeature<OlGeometry>) => {
      let keys = olFeature
        .getKeys()
        .filter((key: string) => !key.startsWith(excludePrefix));

      if (format === ExportFormat.Shapefile && olFeature.get('_style')) {
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
      let comment: string = '';
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
    format: ExportFormat,
    title: string,
    encoding: EncodingFormat,
    projectionIn: string,
    projectionOut: string
  ): Observable<void> {
    const doExport = (observer: Observer<void>) => {
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
              observer,
              format,
              title,
              projectionIn,
              projectionOut
            );
          } else {
            observer.error(new ExportInvalidFileError());
          }
          return;
        }
        this.exportWithOgre(
          olFeatures,
          observer,
          format,
          title,
          encoding,
          projectionIn,
          projectionOut
        );
      } else {
        this.exportToFile(
          olFeatures,
          observer,
          format,
          title,
          projectionIn,
          projectionOut
        );
      }
    };

    return new Observable(doExport);
  }

  protected exportToFile(
    olFeatures: OlFeature<OlGeometry>[],
    observer: Observer<void>,
    format: ExportFormat,
    title: string,
    projectionIn: string,
    projectionOut: string
  ) {
    const olFormat = new olformat[format]();
    const featuresText = olFormat.writeFeatures(olFeatures, {
      dataProjection: projectionOut,
      featureProjection: projectionIn,
      featureType: 'feature',
      featureNS: 'http://example.com/feature'
    });

    const fileName = `${title}.${format.toLowerCase()}`;

    downloadContent(featuresText, 'attachment/plain;charset=utf-8', fileName);
    observer.complete();
  }

  private exportWithOgre(
    olFeatures: OlFeature<OlGeometry>[],
    observer: Observer<void>,
    format: string,
    title: string,
    encodingType: EncodingFormat,
    projectionIn: string,
    projectionOut: string
  ) {
    let featuresText: string = new olformat.GeoJSON().writeFeatures(
      olFeatures,
      {
        dataProjection: projectionOut,
        featureProjection: projectionIn
      }
    );

    const url = `${this.ogreUrl}/convertJson`;
    const form = document.createElement('form');
    form.style.display = 'none';
    document.body.appendChild(form);
    form.setAttribute('method', 'post');
    form.setAttribute('target', '_blank');
    form.setAttribute('action', url);

    if (encodingType === EncodingFormat.UTF8) {
      form.acceptCharset = 'UTF-8';
      form.enctype = 'application/x-www-form-urlencoded; charset=utf-8;';
    } else if (encodingType === EncodingFormat.LATIN1) {
      const enctype = 'ISO-8859-1';
      const featuresJson = JSON.parse(featuresText);
      featuresJson.features.map((f) => {
        const encodedProperties = String.fromCharCode.apply(
          null,
          encode(JSON.stringify(f.properties), { mode: 'replacement' })
        );
        f.properties = JSON.parse(encodedProperties);
      });
      featuresText = JSON.stringify(featuresJson);
      const encoding = document.createElement('input');
      encoding.setAttribute('type', 'hidden');
      encoding.setAttribute('name', 'encoding');
      encoding.setAttribute('value', enctype);
      form.appendChild(encoding);
    }

    if (format === 'CSVsemicolon') {
      const options = document.createElement('input');
      options.setAttribute('type', 'hidden');
      options.setAttribute('name', 'lco');
      options.setAttribute('value', 'SEPARATOR=SEMICOLON');
      form.appendChild(options);
    }

    const geojsonField = document.createElement('input');
    geojsonField.setAttribute('type', 'hidden');
    geojsonField.setAttribute('name', 'json');
    geojsonField.setAttribute('value', featuresText);
    form.appendChild(geojsonField);

    const outputNameField = document.createElement('input');
    let outputName =
      format === 'Shapefile'
        ? `${title}.zip`
        : `${title}.${format.toLowerCase()}`;
    if (format === 'CSVcomma' || format === 'CSVsemicolon') {
      outputName = `${title}.csv`;
    }
    outputName = outputName.replace(' ', '_');
    outputName = outputName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/’/g, "'");
    outputNameField.setAttribute('type', 'hidden');
    outputNameField.setAttribute('name', 'outputName');
    outputNameField.setAttribute('value', outputName);
    form.appendChild(outputNameField);

    let ogreFormat = ExportService.ogreFormats[format];
    if (format === 'CSVcomma' || format === 'CSVsemicolon') {
      ogreFormat = 'CSV';
    }
    const outputFormatField = document.createElement('input');
    outputFormatField.setAttribute('type', 'hidden');
    outputFormatField.setAttribute('name', 'format');
    outputFormatField.setAttribute('value', ogreFormat);
    form.appendChild(outputFormatField);

    form.submit();
    document.body.removeChild(form);

    observer.complete();
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
}
