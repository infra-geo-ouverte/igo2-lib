import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { uuid } from '@igo2/utils';

import OlFeature from 'ol/Feature';
import * as olformat from 'ol/format';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { Observable, Observer } from 'rxjs';

import { Feature } from '../../feature/shared/feature.interfaces';
import {
  ImportInvalidFileError,
  ImportOgreServerError,
  ImportSRSError,
  ImportSizeError,
  ImportUnreadableFileError
} from './import.errors';
import { ImportExportServiceOptions } from './import.interface';
import { computeLayerTitleFromFile, getFileExtension } from './import.utils';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  static formatExtensionAssociation = {
    GeoJSON: 'geojson',
    GML: 'gml',
    GPX: 'gpx',
    KML: 'kml',
    Shapefile: 'zip'
  };

  static allowedMimeTypes = [
    'application/gml+xml',
    'application/vnd.google-earth.kml+xml',
    'application/gpx+xml',
    'application/json'
  ];

  static allowedZipMimeTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip'
  ];

  static allowedExtensions = ['geojson', 'kml', 'gpx', 'json', 'gml', 'zip'];

  private ogreUrl: string;
  private clientSideFileSizeMax: number;

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    const importConfig = this.config.getConfig(
      'importExport'
    ) as ImportExportServiceOptions;
    this.ogreUrl = importConfig.url;
    const configFileSizeMb = importConfig.clientSideFileSizeMaxMb;
    this.clientSideFileSizeMax =
      (configFileSizeMb ? configFileSizeMb : 30) * Math.pow(1024, 2);
    if (importConfig.formats) {
      ImportService.allowedExtensions = importConfig.formats
        .map((format) => ImportService.formatExtensionAssociation[format])
        .filter((e) => e);
      if (ImportService.allowedExtensions.includes('geojson')) {
        ImportService.allowedExtensions.push('json');
      }
    }
  }

  import(
    file: File,
    projectionIn = 'EPSG:4326',
    projectionOut = 'EPSG:4326'
  ): Observable<Feature[]> {
    return this.importAsync(file, projectionIn, projectionOut);
  }

  private getFileImporter(
    file: File
  ): (
    file: File,
    observer: Observer<Feature[]>,
    projectionIn: string,
    projectionOut: string
  ) => void {
    const extension = getFileExtension(file);
    const allowedExtensions = ImportService.allowedExtensions;
    let zipMimeTypes = [];
    if (allowedExtensions.includes('zip')) {
      zipMimeTypes = ImportService.allowedZipMimeTypes;
    }
    const mimeType = file.type;
    const allowedMimeTypes = [
      ...ImportService.allowedMimeTypes,
      ...zipMimeTypes
    ];

    if (
      allowedMimeTypes.indexOf(mimeType) < 0 &&
      allowedExtensions.indexOf(extension) < 0
    ) {
      return undefined;
    } else if (
      mimeType === 'application/json' ||
      ['json', 'geojson', 'kml', 'gpx'].indexOf(extension) >= 0
    ) {
      return this.importFile;
    } else if (this.ogreUrl !== undefined) {
      return this.importFileWithOgre;
    }

    return undefined;
  }

  private importAsync(
    file: File,
    projectionIn: string,
    projectionOut: string
  ): Observable<Feature[]> {
    const doImport = (observer: Observer<Feature[]>) => {
      if (file.size >= this.clientSideFileSizeMax) {
        observer.error(new ImportSizeError());
        return;
      }
      const importer = this.getFileImporter(file);
      if (importer === undefined) {
        observer.error(new ImportInvalidFileError());
        return;
      }

      importer.call(this, file, observer, projectionIn, projectionOut);
    };

    return new Observable(doImport);
  }

  private importFile(
    file: File,
    observer: Observer<Feature[]>,
    projectionIn: string,
    projectionOut: string
  ) {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      try {
        const features = this.parseFeaturesFromFile(
          file,
          event.target.result,
          projectionIn,
          projectionOut
        );
        observer.next(features);
      } catch {
        observer.error(new ImportUnreadableFileError());
      }

      observer.complete();
    };

    reader.onerror = () => {
      observer.error(new ImportUnreadableFileError());
    };

    reader.readAsText(file, 'UTF-8');
  }

  private importFileWithOgre(
    file: File,
    observer: Observer<Feature[]>,
    projectionIn: string,
    projectionOut: string
  ) {
    const url = `${this.ogreUrl}/convert`;
    const formData = new FormData();
    formData.append('upload', file);
    formData.append('sourceSrs', projectionIn);
    formData.append('targetSrs', projectionOut);
    formData.append('formatOutput', 'GEOJSON');
    formData.append('skipFailures', '');

    this.http.post(url, formData, { headers: new HttpHeaders() }).subscribe(
      (response: { errors?: string[] } | object | null) => {
        if (response === null) {
          observer.error(new ImportUnreadableFileError());
          return;
        }

        const errors = (response as any).errors || [];
        if (errors.length > 0) {
          observer.error(new ImportUnreadableFileError());
        } else {
          const features = this.parseFeaturesFromGeoJSON(
            file,
            response,
            projectionOut
          );
          observer.next(features);
          observer.complete();
        }
      },
      (error: any) => {
        error.error.caught = true;
        const errMsg = error.error.msg || '';
        if (errMsg === 'No valid files found') {
          observer.error(new ImportInvalidFileError());
        } else if (
          errMsg &&
          errMsg.startWith('ERROR 1: Failed to process SRS definition')
        ) {
          observer.error(new ImportSRSError());
        } else if (error.status === 500) {
          observer.error(new ImportOgreServerError());
        } else {
          observer.error(new ImportUnreadableFileError());
        }
      }
    );
  }

  private parseFeaturesFromFile(
    file: File,
    data: string,
    projectionIn: string,
    projectionOut: string
  ): Feature[] {
    const extension = getFileExtension(file);
    const mimeType = file.type;

    const GeoJSON = new olformat.GeoJSON();

    let format;
    if (mimeType === 'application/vnd.google-earth.kml+xml') {
      format = new olformat.KML();
    } else if (mimeType === 'application/gml+xml') {
      format = new olformat.GML();
    } else if (mimeType === 'application/gpx+xml') {
      format = new olformat.GPX();
    } else {
      switch (extension) {
        case 'kml':
          format = new olformat.KML();
          break;
        case 'gpx':
          format = new olformat.GPX();
          break;
        case 'gml':
          format = new olformat.GML();
          break;
        default:
          format = GeoJSON;
          break;
      }
    }

    const olFeatures = format.readFeatures(data, {
      dataProjection: projectionIn,
      featureProjection: projectionOut
    });
    const features = olFeatures.map((olFeature: OlFeature<OlGeometry>) => {
      return Object.assign(GeoJSON.writeFeatureObject(olFeature), {
        projection: projectionOut,
        meta: {
          id: uuid(),
          title: computeLayerTitleFromFile(file)
        }
      });
    });

    return features;
  }

  private parseFeaturesFromGeoJSON(
    file: File,
    data: object,
    projectionOut: string
  ): Feature[] {
    const olFormat = new olformat.GeoJSON();
    const olFeatures = olFormat.readFeatures(data);
    const features = olFeatures.map((olFeature: OlFeature<OlGeometry>) => {
      return Object.assign(olFormat.writeFeatureObject(olFeature), {
        projection: projectionOut,
        meta: {
          id: uuid(),
          title: computeLayerTitleFromFile(file)
        }
      });
    });

    return features as Feature[];
  }
}
