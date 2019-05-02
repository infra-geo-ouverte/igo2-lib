import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core';

import { Observable, Observer } from 'rxjs';

import * as olformat from 'ol/format';
import OlFeature from 'ol/Feature';

import { downloadContent } from './export.utils';
import { ExportFormat } from './export.type';
import { ExportInvalidFileError } from './export.errors';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  static ogreFormats = {
    Shapefile: 'ESRI Shapefile'
  };

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
      const keys = olFeature.getKeys().filter((key: string) => !key.startsWith('_'));
      const properties = keys.reduce((acc: object, key: string) => {
        acc[key] = olFeature.get(key);
        return acc;
      }, {geometry: olFeature.getGeometry()});
      return new OlFeature(properties);
    });

    return this.exportAsync(exportOlFeatures, format, title, projectionIn, projectionOut);
  }

  private exportAsync(
    olFeatures: OlFeature[],
    format: ExportFormat,
    title: string,
    projectionIn: string,
    projectionOut: string
  ): Observable<void> {
    const doExport = (observer: Observer<void>) => {
      if (Object.keys(ExportService.ogreFormats).indexOf(format) >= 0) {
        if (this.ogreUrl === undefined) {
          observer.error(new ExportInvalidFileError());
          return;
        }
        this.exportWithOgre(olFeatures, observer, format, title, projectionIn, projectionOut);
      } else {
        this.exportToFile(olFeatures, observer, format, title, projectionIn, projectionOut);
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

    const url = `${this.ogreUrl}/convert`;
    const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', url);

    const geojsonField = document.createElement('input');
    geojsonField.setAttribute('type', 'hidden');
    geojsonField.setAttribute('name', 'json');
    geojsonField.setAttribute('value', featuresText);
    form.appendChild(geojsonField);

    const outputNameField = document.createElement('input');
    outputNameField.setAttribute('type', 'hidden');
    outputNameField.setAttribute('name', 'outputName');
    outputNameField.setAttribute('value', title + '.zip');
    form.appendChild(outputNameField);

    const ogreFormat = ExportService.ogreFormats[format];
    const outputFormatField = document.createElement('input');
    outputFormatField.setAttribute('type', 'hidden');
    outputFormatField.setAttribute('name', 'formatOutput');
    outputFormatField.setAttribute('value', ogreFormat);
    form.appendChild(outputFormatField);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    observer.complete();
  }
}
