import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import GML from 'ol/format/gml';
import KML from 'ol/format/kml';
import GeoJSON from 'ol/format/geojson';
import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Style from 'ol/style/style';
import Circle from 'ol/style/circle';

import { ConfigService, MessageService, LanguageService } from '../../core';
import { MapService } from '../../map/shared/map.service';
import { VectorLayer } from '../../layer/shared/layers';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';

import { ExportOptions } from './import-export.interface';


@Injectable()
export class ImportExportService {

  private urlApi: string;

  constructor(private http: HttpClient,
              private config: ConfigService,
              private mapService: MapService,
              private messageService: MessageService,
              private languageService: LanguageService) {

    this.urlApi = this.config.getConfig('importExport.url');
  }

  public import(fileList: Array<File>, sourceSrs = 'EPSG:4326') {
    const count = fileList.length;
    let i = 1;
    for (const file of fileList) {
      const ext = file.name.split('.')[file.name.split('.').length - 1];
      const mimeType = file.type;
      const mimeTypeAllowed = [
        'application/gml+xml',
        'application/vnd.google-earth.kml+xml',
        'application/json'
      ];
      if (ext === 'geojson' || mimeTypeAllowed.includes(mimeType)) {
        this.readFile(file, sourceSrs, i++, count);
      } else if (mimeType === 'application/zip') {
        this.callImportService(file, sourceSrs);
      } else {
        this.onFilesInvalid([file]);
      }
    }
  }

  public onFilesInvalid(fileList: Array<File>) {
    const translate = this.languageService.translate;
    const count = fileList.length;
    let i = 1;
    for (const file of fileList) {
      const title = translate.instant('igo.dropGeoFile.invalid.title', {
        i: i++,
        count: count
      });
      const message = translate.instant('igo.dropGeoFile.invalid.text', {
        value: file.name
      });
      this.messageService.error(message, title);
    }
  }

  public export(data: ExportOptions) {
    const map = this.mapService.getMap();
    const layer = map.getLayerById(data.layer);
    const source: any = layer.ol.getSource();

    let format;

    switch (data.format) {
      case 'shapefile':
        format =  new GeoJSON();
        break;
      case 'GML':
        format =  new GML();
        break;
      case 'KML':
        format =  new KML();
        break;
      case 'GeoJSON':
        format =  new GeoJSON();
        break;
      default:
        format =  new GeoJSON();
        break;
    }

    const featuresText = format.writeFeatures(source.getFeatures(), {
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

  private download(text: string, fileName: string, mineType = 'text/plain;charset=utf-8') {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${mineType},${encodeURIComponent(text)}`);
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  private readFile(file: File, sourceSrs, i = 1, count = 1) {
    const translate = this.languageService.translate;
    const reader = new FileReader();

    reader.onload = (evt: any) => {
      const layerTitle = file.name.substr(0, file.name.lastIndexOf('.'));
      this.addFeaturesLayer(evt.target.result, layerTitle, sourceSrs, file.type);
      const title = translate.instant('igo.dropGeoFile.success.title', {
        i: i,
        count: count
      });
      const message = translate.instant('igo.dropGeoFile.success.text', {
        value: layerTitle
      });
      this.messageService.success(message, title);
    };

    reader.onerror = (evt) => {
      const title = translate.instant('igo.dropGeoFile.unreadable.title');
      const message = translate.instant('igo.dropGeoFile.unreadable.text', {
        value: file.name
      });
      this.messageService.error(message, title);
    };

    reader.readAsText(file, 'UTF-8');
  }

  private addFeaturesLayer(text, title, sourceSrs, mimeType?) {
    const map = this.mapService.getMap();
    const overlayDataSource = new FeatureDataSource({
      title: title
    });

    let format: any = new GeoJSON();
    if (mimeType === 'application/vnd.google-earth.kml+xml') {
      format = new KML();
    } else if (mimeType === 'application/gml+xml') {
      format = new GML();
    }

    const olFeature = format.readFeatures(text, {
      dataProjection: sourceSrs,
      featureProjection: map.projection
    });
    overlayDataSource.ol.addFeatures(olFeature);

    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    const stroke = new Stroke({
      color: [r, g, b, 1],
      width: 2
    });

    const fill = new Fill({
      color: [r, g, b, 0.40]
    });

    const layer = new VectorLayer(overlayDataSource, {
      style: new Style({
          stroke: stroke,
          fill: fill,
          image: new Circle({
            radius: 5,
            stroke: stroke,
            fill: fill
          })
        })
    });
    map.addLayer(layer);
  }

  private callImportService(file: File, sourceSrs) {
    const translate = this.languageService.translate;
    const layerTitle = file.name.substr(0, file.name.lastIndexOf('.'));
    const map = this.mapService.getMap();
    const url = this.urlApi + '/convert';

    const formData = new FormData();
    formData.append('upload', file);
    formData.append('sourceSrs', sourceSrs);
    formData.append('targetSrs', map.projection);
    const request = this.http.post(url, formData, {
      headers: new HttpHeaders()
    });

    request.subscribe(
        (res) => {
          this.addFeaturesLayer(res, layerTitle, map.projection);
          const title = translate.instant('igo.dropGeoFile.success.title', {
            i: 1,
            count: 1
          });
          const message = translate.instant('igo.dropGeoFile.success.text', {
            value: layerTitle
          });
          this.messageService.success(message, title);
        },
        (err) => {
          const title = translate.instant('igo.dropGeoFile.unreadable.title');
          const message = translate.instant('igo.dropGeoFile.unreadable.text', {
            value: file.name
          });
          this.messageService.error(message, title);
        }
      );
  }

  private callExportService(geojson, title) {
    const url = this.urlApi + '/convertJson';

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
