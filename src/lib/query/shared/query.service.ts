import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import * as ol from 'openlayers';

import { uuid } from '../../utils/uuid';
import { Feature, FeatureType, FeatureFormat, SourceFeatureType,
         FeatureService } from '../../feature';
import { DataSource, QueryableDataSource } from '../../datasource';
import { Layer } from '../../layer';

import { QueryFormat } from './query.enum';
import { QueryOptions } from './query.interface';


@Injectable()
export class QueryService {

  constructor(private http: HttpClient,
              private featureService: FeatureService) { }

  query(layers: Layer[], options: QueryOptions): Observable<Feature[]>[] {

    return layers
      .filter((layer: Layer) => layer.visible && layer.isInResolutionsRange)
      .map((layer: Layer) => this.queryDataSource(layer.dataSource, options, layer.zIndex));
  }

  queryDataSource(dataSource: DataSource, options: QueryOptions,
    zIndex: number): Observable<Feature[]> {

    const url = (dataSource as any as QueryableDataSource).getQueryUrl(options);
    const request = this.http.get(url, {responseType: 'text'});

    this.featureService.clear();

    return request.map(res => this.extractData(res, dataSource, options, url, zIndex));
  }

  private extractData(res, dataSource: DataSource, options: QueryOptions,
                      url: string, zIndex: number): Feature[] {

    const queryDataSource = (dataSource as any as QueryableDataSource);

    let features = [];
    switch (queryDataSource.queryFormat) {
      case QueryFormat.GML2:
        features = this.extractGML2Data(res, zIndex);
        break;
      case QueryFormat.GML3:
        features = this.extractGML3Data(res, zIndex);
        break;
      case QueryFormat.JSON:
      case QueryFormat.GEOJSON:
        features = this.extractGeoJSONData(res);
        break;
      case QueryFormat.TEXT:
        features = this.extractTextData(res);
        break;
      case QueryFormat.HTML:
        features = this.extractHtmlData(res, queryDataSource.queryHtmlTarget, url);
        break;
      default:
        break;
    }

    return features.map((feature: Feature, index: number) => {
      const title = feature.properties[queryDataSource.queryTitle];

      return Object.assign(feature, {
        id: uuid(),
        source: dataSource.title,
        sourceType: SourceFeatureType.Query,
        order: 1000 - zIndex,
        title: title ? title : `${dataSource.title} (${index + 1})`,
        projection: options.projection
      });
    });
  }

  private extractGML2Data(res, zIndex) {
    let parser = new ol.format.GML2();
    let features = parser.readFeatures(res);

    // Handle non standard GML output (MapServer)
    if (features.length === 0) {
      parser = new ol.format.WMSGetFeatureInfo();
      features = parser.readFeatures(res);
    }

    return features.map(feature => this.featureToResult(feature, zIndex));
  }

  private extractGML3Data(res, zIndex) {
    const parser = new ol.format.GML3();
    const features = parser.readFeatures(res);

    return features.map(feature => this.featureToResult(feature, zIndex));
  }

  private extractGeoJSONData(res) {
    let features = [];
    try {
      features = JSON.parse(res).features;
    } catch (e) {
      console.warn('query.service: Unable to parse geojson', '\n', res);
    }
    return features;
  }

  private extractTextData(res) {
    // TODO
    return [];
  }

  private extractHtmlData(res, htmlTarget, url) {
    // _blank , modal , innerhtml or undefined
    const searchParams = this.getQueryParams(url.toLowerCase());
    const bboxRaw = searchParams['bbox'];
    const width = parseInt(searchParams['width'], 10);
    const height = parseInt(searchParams['height'], 10);
    const wmsVersion = searchParams['version'];
    let xPosition;
    let yPosition;

    if (wmsVersion === '1.3.0') {
      xPosition = parseInt(searchParams['i'], 10);
      yPosition = parseInt(searchParams['j'], 10);
    } else {
      xPosition = parseInt(searchParams['x'], 10);
      yPosition = parseInt(searchParams['y'], 10);
    }

    const bbox = bboxRaw.split(',');
    let threshold = (Math.abs(parseFloat(bbox[0])) - Math.abs(parseFloat(bbox[2]))) * (0.1);

    // for context in degree (EPSG:4326,4269...)
    if (Math.abs(parseFloat(bbox[0])) < 180) {
       threshold = 0.045;
    }

    const clickx = parseFloat(bbox[0]) + Math.abs(parseFloat(bbox[0]) - parseFloat(bbox[2]))
                  * xPosition / width - threshold;
    const clicky = parseFloat(bbox[1]) + Math.abs(parseFloat(bbox[1]) - parseFloat(bbox[3]))
                  * yPosition / height - threshold;
    const clickx1 = clickx + threshold * 2;
    const clicky1 = clicky + threshold * 2;

    const wktPoly = 'POLYGON((' + clickx + ' ' + clicky + ', ' + clickx + ' ' + clicky1 +
                ', ' + clickx1 + ' ' + clicky1 + ', ' + clickx1 + ' ' + clicky +
                ', ' + clickx + ' ' + clicky + '))';


    const format = new ol.format.WKT();
    const tenPercentWidthGeom = format.readFeature(wktPoly);
    const f = (tenPercentWidthGeom.getGeometry() as any);

    let targetIgo2 = '_blank';
    let iconHtml = 'link';

    switch (htmlTarget) {
      case 'newtab':
        targetIgo2 = '_blank';
        break;
      case 'modal':
        targetIgo2 = 'modal';
        iconHtml = 'place';
        break;
      case 'innerhtml':
        targetIgo2 = 'innerhtml';
        iconHtml = 'place';
        const bodyTagStart = res.toLowerCase().indexOf('<body>');
        const bodyTagEnd = res.toLowerCase().lastIndexOf('</body>') + 7;
        // replace \r \n  and ' ' with '' to validate if the body is really empty.
        const body = res.slice(bodyTagStart, bodyTagEnd).replace(/(\r|\n|\s)/g, '' );
        if ( body === '<body></body>' || res === '' ) {
          return [];
        }
        break;
    }


    return [{
      id: 'html1',
      source: 'title',
      type: FeatureType.Feature,
      format: FeatureFormat.GeoJSON,
      title: 'title',
      icon: iconHtml,
      projection: 'EPSG:3857',
      properties: {target: targetIgo2, body: res, url: url},
      geometry: {type: f.getType(), coordinates: f.getCoordinates()}
    }];
  }

  private getQueryParams(url) {
    const queryString = url.split('?');
    if (!queryString[1]) {
      return;
    }
    const pairs = queryString[1].split('&');

    const result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    return result;
  }

  private featureToResult(feature: ol.Feature, zIndex: number): Feature {
    const featureGeometry = (feature.getGeometry() as any);
    const properties = Object.assign({}, feature.getProperties());
    delete properties['geometry'];
    delete properties['boundedBy'];

    let geometry;
    if (featureGeometry !== undefined) {
      geometry = {
        type: featureGeometry.getType(),
        coordinates: featureGeometry.getCoordinates()
      };
    }

    return {
      id: undefined,
      source: undefined,
      sourceType: SourceFeatureType.Query,
      type: FeatureType.Feature,
      order: 1000 - zIndex,
      format: FeatureFormat.GeoJSON,
      title: undefined,
      icon: 'place',
      projection: undefined,
      properties: properties,
      geometry: geometry
    };
  }
}
