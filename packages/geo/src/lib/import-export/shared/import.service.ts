import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ConfigService } from '@igo2/core';

import { Observable, Observer } from 'rxjs';

import * as olformat from 'ol/format';
import OlFeature from 'ol/Feature';

import { Feature } from '../../feature/shared/feature.interfaces';
import { ImportInvalidFileError, ImportUnreadableFileError } from './import.errors';

@Injectable({
  providedIn: 'root'
})
export class ImportService {

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

  static allowedExtensions = [
    'geojson',
    'kml',
    'gpx',
    'json',
    'gml'
  ];

  private ogreUrl: string;

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.ogreUrl = this.config.getConfig('importExport.url');
  }

  import(file: File, projectionIn = 'EPSG:4326', projectionOut = 'EPSG:4326'): Observable<Feature[]> {
    return this.importAsync(file, projectionIn, projectionOut);
  }

  private getFileImporter(file: File): (file: File, observer: Observer<Feature[]>, projectionIn: string, projectionOut: string) => void {
    const extension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;
    const allowedMimeTypes = [...ImportService.allowedMimeTypes, ...ImportService.allowedZipMimeTypes];
    const allowedExtensions = ImportService.allowedExtensions;

    if (allowedMimeTypes.indexOf(mimeType) < 0 && allowedExtensions.indexOf(extension) < 0) {
      return undefined;
    } else if (mimeType === 'application/json' || ['json', 'geojson', 'kml'].indexOf(extension) >= 0) {
      return this.importFile;
    } else if (this.ogreUrl !== undefined) {
      return this.importFileWithOgre;
    }

    return undefined;
  }

  private importAsync(file: File, projectionIn: string, projectionOut: string): Observable<Feature[]> {
    const doImport = (observer: Observer<Feature[]>) => {
      const importer = this.getFileImporter(file);
      if (importer === undefined) {
        observer.error(new ImportInvalidFileError());
        return;
      }

      importer.call(this, file, observer, projectionIn, projectionOut);
    };

    return new Observable(doImport);
  }

  private importFile(file: File, observer: Observer<Feature[]>, projectionIn: string, projectionOut: string) {
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
      } catch (e) {
        observer.error(new ImportUnreadableFileError());
      }

      observer.complete();
    };

    reader.onerror = evt => {
      observer.error(new ImportUnreadableFileError());
    };

    reader.readAsText(file, 'UTF-8');
  }

  private importFileWithOgre(file: File, observer: Observer<Feature[]>, projectionIn: string, projectionOut: string) {
    const url = `${this.ogreUrl}/convert`;
    const formData = new FormData();
    formData.append('upload', file);
    formData.append('sourceSrs', projectionIn);
    formData.append('targetSrs', projectionOut);
    formData.append('formatOutput', 'GEOJSON');
    formData.append('skipFailures', '');

    this.http
      .post(url, formData, {headers: new HttpHeaders()})
      .subscribe(
        (response: {errors?: string[]} | object) => {
          const errors = (response as any).errors || [];
          if (errors.length > 0) {
            observer.error(new ImportUnreadableFileError());
          } else {
            const features = this.parseFeaturesFromGeoJSON(response, projectionOut);
            observer.next(features);
            observer.complete();
          }
        },
        (error: Error) => {
          observer.error(new ImportUnreadableFileError());
        }
      );
  }

  private parseFeaturesFromFile(file: File, data: string, projectionIn: string, projectionOut: string): Feature[] {
    const extension = file.name.split('.').pop().toLowerCase();
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
    const features = olFeatures.map((olFeature: OlFeature) => {
      return Object.assign(GeoJSON.writeFeatureObject(olFeature), {
        projection: projectionOut
      });
    });

    return features;
  }

  private parseFeaturesFromGeoJSON(data: object, projectionOut: string): Feature[] {
    const olFormat = new olformat.GeoJSON();
    const olFeatures = olFormat.readFeatures(data);
    const features = olFeatures.map((olFeature: OlFeature) => {
      return Object.assign(olFormat.writeFeatureObject(olFeature), {
        projection: projectionOut
      });
    });

    return features;
  }
}
