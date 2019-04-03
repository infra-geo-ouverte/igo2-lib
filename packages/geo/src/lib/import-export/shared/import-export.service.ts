import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as olformat from 'ol/format';
import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { ConfigService, MessageService, LanguageService } from '@igo2/core';
import { MapService } from '../../map/shared/map.service';
import { VectorLayer } from '../../layer/shared/layers';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';

import { ExportOptions } from './import-export.interface';

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {
  private exportUrl: string;

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private mapService: MapService,
    private messageService: MessageService,
    private languageService: LanguageService
  ) {
    this.exportUrl = this.config.getConfig('importExport.url');
  }

  public import(fileList: Array<File>, sourceSrs = 'EPSG:4326') {
    const count = fileList.length;
    let i = 1;
    for (const file of fileList) {
      const ext = file.name
        .split('.')
        [file.name.split('.').length - 1].toLowerCase();
      const mimeType = file.type;
      const mimeTypeAllowed = [
        'application/gml+xml',
        'application/vnd.google-earth.kml+xml',
        'application/gpx+xml',
        'application/json'
      ];
      const zipMimeType = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-zip'
      ];
      const extensionAllowed = ['geojson', 'kml', 'gpx', 'json'];
      if (
        mimeTypeAllowed.indexOf(mimeType) !== -1 ||
        extensionAllowed.indexOf(ext.toLowerCase()) !== -1
      ) {
        this.readFile(file, sourceSrs, ext, i++, count);
      } else if (zipMimeType.indexOf(mimeType) !== -1) {
        this.callImportService(file, sourceSrs);
      } else {
        this.onFilesInvalid(file);
      }
    }
  }

  public onFilesInvalid(file: File) {
    const translate = this.languageService.translate;
    const title = translate.instant('igo.geo.dropGeoFile.invalid.title');
    const message = translate.instant('igo.geo.dropGeoFile.invalid.text', {
      value: file.name,
      mimeType: file.type
    });
    this.messageService.error(message, title);
  }

  public export(data: ExportOptions) {
    const map = this.mapService.getMap();
    const layer = map.getLayerById(data.layer);
    const olSource = layer.ol.getSource();

    const formatStr = data.format;
    const format =
      data.format === 'shapefile'
        ? new olformat.GeoJSON()
        : new olformat[formatStr]();

    const olFeatures = olSource.getFeatures().map((olFeature: OlFeature) => {
      const keys = olFeature.getKeys().filter((key: string) => !key.startsWith('_'));
      const properties = keys.reduce((acc: object, key: string) => {
        acc[key] = olFeature.get(key);
        return acc;
      }, {geometry: olFeature.getGeometry()});
      return new OlFeature(properties);
    });

    const featuresText = format.writeFeatures(olFeatures, {
      dataProjection: 'EPSG:4326',
      featureProjection: map.projection,
      featureType: 'feature',
      featureNS: 'http://example.com/feature'
    });

    if (data.format === 'shapefile') {
      this.callExportService(featuresText, layer.title);
      return;
    }

    const title = `${layer.title}.${data.format.toLowerCase()}`;
    this.download(featuresText, title);
  }

  private download(
    text: string,
    fileName: string,
    mimeType = 'text/plain;charset=utf-8'
  ) {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:${mimeType},${encodeURIComponent(text)}`
    );
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  private readFile(file: File, sourceSrs, ext, i = 1, count = 1) {
    const translate = this.languageService.translate;
    const reader = new FileReader();

    reader.onload = (evt: any) => {
      const layerTitle = file.name.substr(0, file.name.lastIndexOf('.'));
      this.addFeaturesLayer(
        evt.target.result,
        layerTitle,
        sourceSrs,
        ext,
        file.type
      );
      const title = translate.instant('igo.geo.dropGeoFile.success.title', {
        i,
        count
      });
      const message = translate.instant('igo.geo.dropGeoFile.success.text', {
        value: layerTitle
      });
      this.messageService.success(message, title);
    };

    reader.onerror = evt => {
      const title = translate.instant('igo.geo.dropGeoFile.unreadable.title');
      const message = translate.instant('igo.geo.dropGeoFile.unreadable.text', {
        value: file.name
      });
      this.messageService.error(message, title);
    };

    reader.readAsText(file, 'UTF-8');
  }

  private addFeaturesLayer(text, title, sourceSrs, ext?, mimeType?) {
    const map = this.mapService.getMap();
    const overlayDataSource = new FeatureDataSource();

    let format: any = new olformat.GeoJSON();
    if (mimeType === 'application/vnd.google-earth.kml+xml') {
      format = new olformat.KML();
    } else if (mimeType === 'application/gml+xml') {
      format = new olformat.GML();
    } else if (mimeType === 'application/gpx+xml') {
      format = new olformat.GPX();
    } else if (ext) {
      ext = ext.toLowerCase();
      switch (ext) {
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
          break;
      }
    }

    const olFeature = format.readFeatures(text, {
      dataProjection: sourceSrs,
      featureProjection: map.projection
    });
    overlayDataSource.ol.addFeatures(olFeature);

    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    const stroke = new olstyle.Stroke({
      color: [r, g, b, 1],
      width: 2
    });

    const fill = new olstyle.Fill({
      color: [r, g, b, 0.4]
    });

    const layer = new VectorLayer({
      title,
      source: overlayDataSource,
      style: new olstyle.Style({
        stroke,
        fill,
        image: new olstyle.Circle({
          radius: 5,
          stroke,
          fill
        })
      })
    });
    map.addLayer(layer);
  }

  private callImportService(file: File, sourceSrs) {
    const translate = this.languageService.translate;
    const layerTitle = file.name.substr(0, file.name.lastIndexOf('.'));
    const map = this.mapService.getMap();
    const url = this.exportUrl + '/convert';

    const formData = new FormData();
    formData.append('upload', file);
    formData.append('sourceSrs', sourceSrs);
    formData.append('targetSrs', map.projection);
    const request = this.http.post(url, formData, {
      headers: new HttpHeaders()
    });

    request.subscribe(
      res => {
        this.addFeaturesLayer(res, layerTitle, map.projection);
        const title = translate.instant('igo.geo.dropGeoFile.success.title', {
          i: 1,
          count: 1
        });
        const message = translate.instant('igo.geo.dropGeoFile.success.text', {
          value: layerTitle
        });
        this.messageService.success(message, title);
      },
      err => {
        const title = translate.instant('igo.geo.dropGeoFile.unreadable.title');
        const message = translate.instant(
          'igo.geo.dropGeoFile.unreadable.text',
          {
            value: file.name
          }
        );
        this.messageService.error(message, title);
      }
    );
  }

  private callExportService(geojson, title) {
    const url = this.exportUrl + '/convertJson';

    const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', url);

    const geojsonField = document.createElement('input');
    geojsonField.setAttribute('type', 'hidden');
    geojsonField.setAttribute('name', 'json');
    geojsonField.setAttribute('value', geojson);
    form.appendChild(geojsonField);

    const fileNameField = document.createElement('input');
    fileNameField.setAttribute('type', 'hidden');
    fileNameField.setAttribute('name', 'fileName');
    fileNameField.setAttribute('value', title);
    form.appendChild(fileNameField);

    const outputNameField = document.createElement('input');
    outputNameField.setAttribute('type', 'hidden');
    outputNameField.setAttribute('name', 'outputName');
    outputNameField.setAttribute('value', title + '.zip');
    form.appendChild(outputNameField);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }
}
