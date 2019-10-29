import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core';
import { downloadContent } from '@igo2/utils';

import { Observable, Observer } from 'rxjs';

import * as olformat from 'ol/format';
import OlFeature from 'ol/Feature';

import { ExportFormat } from './export.type';
import {
  ExportInvalidFileError,
  ExportNothingToExportError
} from './export.errors';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  static ogreFormats = {
    GML: 'gml',
    GPX: 'gpx',
    KML: 'kml',
    Shapefile: 'ESRI Shapefile',
    CSV: 'CSV'
  };

  static noOgreFallbacks = ['GML', 'GPX', 'KML'];

  private ogreUrl: string;

  constructor(private config: ConfigService) {
    this.ogreUrl = this.config.getConfig('importExport.url');
  }

  export(
    olFeatures: OlFeature[],
    format: ExportFormat,
    title: string,
    projectionIn = 'EPSG:4326',
    projectionOut = 'EPSG:4326'
  ): Observable<void> {
    const exportOlFeatures = olFeatures.map((olFeature: OlFeature) => {
      const keys = olFeature
        .getKeys()
        .filter((key: string) => !key.startsWith('_'));
      const properties = keys.reduce(
        (acc: object, key: string) => {
          acc[key] = olFeature.get(key);
          return acc;
        },
        { geometry: olFeature.getGeometry() }
      );
      return new OlFeature(properties);
    });

    return this.exportAsync(
      exportOlFeatures,
      format,
      title,
      projectionIn,
      projectionOut
    );
  }

  private exportAsync(
    olFeatures: OlFeature[],
    format: ExportFormat,
    title: string,
    projectionIn: string,
    projectionOut: string
  ): Observable<void> {
    const doExport = (observer: Observer<void>) => {
      const nothingToExport = this.nothingToExport(olFeatures, format);
      if (nothingToExport === true) {
        observer.error(new ExportNothingToExportError());
        return;
      }

      const ogreFormats = Object.keys(ExportService.ogreFormats);
      if (ogreFormats.indexOf(format) >= 0) {
        if (this.ogreUrl === undefined) {
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

  private exportToFile(
    olFeatures: OlFeature[],
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

    downloadContent(featuresText, 'text/plain;charset=utf-8', fileName);
    observer.complete();
  }

  private exportWithOgre(
    olFeatures: OlFeature[],
    observer: Observer<void>,
    format: string,
    title: string,
    projectionIn: string,
    projectionOut: string
  ) {
    const featuresText = new olformat.GeoJSON().writeFeatures(olFeatures, {
      dataProjection: projectionOut,
      featureProjection: projectionIn,
      featureType: 'feature',
      featureNS: 'http://example.com/feature'
    });

    const url = `${this.ogreUrl}/convertJson`;
    const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('target', '_blank');
    form.setAttribute('action', url);
    form.acceptCharset = 'UTF-8';
    form.enctype = 'application/x-www-form-urlencoded; charset=utf-8;';

    const geojsonField = document.createElement('input');
    geojsonField.setAttribute('type', 'hidden');
    geojsonField.setAttribute('name', 'json');
    geojsonField.setAttribute('value', featuresText);
    form.appendChild(geojsonField);

    const outputNameField = document.createElement('input');
    const outputName =
      format === 'Shapefile'
        ? `${title}.zip`
        : `${title}.${format.toLowerCase()}`;
    outputNameField.setAttribute('type', 'hidden');
    outputNameField.setAttribute('name', 'outputName');
    outputNameField.setAttribute('value', outputName);
    form.appendChild(outputNameField);

    const ogreFormat = ExportService.ogreFormats[format];
    const outputFormatField = document.createElement('input');
    outputFormatField.setAttribute('type', 'hidden');
    outputFormatField.setAttribute('name', 'format');
    outputFormatField.setAttribute('value', ogreFormat);
    form.appendChild(outputFormatField);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    observer.complete();
  }

  private nothingToExport(olFeatures: OlFeature[], format: string): boolean {
    if (olFeatures.length === 0) {
      return true;
    }
    if (format === 'GPX') {
      const pointOrLine = olFeatures.find(olFeature => {
        return (
          ['Point', 'LineString'].indexOf(olFeature.getGeometry().getType()) >=
          0
        );
      });
      return pointOrLine === undefined;
    }
    return false;
  }
}
