import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import * as olformat from 'ol/format';
import * as olextent from 'ol/extent';
import olFormatGML2 from 'ol/format/GML2';
import olFormatGML3 from 'ol/format/GML3';
import olFormatEsriJSON from 'ol/format/EsriJSON';
import olFeature from 'ol/Feature';

import { uuid } from '@igo2/utils';
import { Feature } from '../../feature/shared/feature.interface';
import { FeatureService } from '../../feature/shared/feature.service';
import {
  FeatureType,
  FeatureFormat,
  SourceFeatureType
} from '../../feature/shared/feature.enum';
import { DataSource } from '../../datasource/shared/datasources/datasource';
import { Layer } from '../../layer/shared/layers/layer';
import {
  WMSDataSource,
  CartoDataSource,
  TileArcGISRestDataSource
} from '../../datasource';

import { QueryFormat } from './query.enum';
import { QueryOptions, QueryableDataSource } from './query.interface';

@Injectable({
  providedIn: 'root'
})
export class QueryService {
  public queryEnabled = true;
  constructor(
    private http: HttpClient,
    private featureService: FeatureService
  ) {}

  query(layers: Layer[], options: QueryOptions): Observable<Feature[]>[] {
    return layers
      .filter((layer: Layer) => layer.visible && layer.isInResolutionsRange)
      .map((layer: Layer) => this.queryLayer(layer, options));
  }

  queryLayer(layer: Layer, options: QueryOptions): Observable<Feature[]> {
    const url = this.getQueryUrl(layer.dataSource, options);
    if (!url) {
      return of([]);
    }
    const request = this.http.get(url, { responseType: 'text' });

    this.featureService.clear();

    return request.pipe(map(res => this.extractData(res, layer, options, url)));
  }

  private extractData(
    res,
    layer: Layer,
    options: QueryOptions,
    url: string
  ): Feature[] {
    const queryDataSource = layer.dataSource as QueryableDataSource;

    let allowedFieldsAndAlias;
    if (layer.options &&
      layer.options.sourceOptions &&
      layer.options.sourceOptions.sourceFields && layer.options.sourceOptions.sourceFields.length >= 1) {
        allowedFieldsAndAlias = {};
      layer.options.sourceOptions.sourceFields.forEach(sourceField => {
        const alias = sourceField.alias ? sourceField.alias : sourceField.name;
        allowedFieldsAndAlias[sourceField.name] = alias;
      });
    }
    let features = [];
    switch (queryDataSource.options.queryFormat) {
      case QueryFormat.GML3:
        features = this.extractGML3Data(res, layer.zIndex, allowedFieldsAndAlias);
        break;
      case QueryFormat.JSON:
      case QueryFormat.GEOJSON:
        features = this.extractGeoJSONData(res);
        break;
      case QueryFormat.ESRIJSON:
        features = this.extractEsriJSONData(res, layer.zIndex);
        break;
      case QueryFormat.TEXT:
        features = this.extractTextData(res);
        break;
      case QueryFormat.HTML:
        features = this.extractHtmlData(
          res,
          queryDataSource.queryHtmlTarget,
          url
        );
        break;
      case QueryFormat.GML2:
      default:
        features = this.extractGML2Data(res, layer, allowedFieldsAndAlias);
        break;
    }

    return features.map((feature: Feature, index: number) => {
      const title = feature.properties[queryDataSource.queryTitle];

      return Object.assign(feature, {
        id: uuid(),
        source: layer.title,
        sourceType: SourceFeatureType.Query,
        order: 1000 - layer.zIndex,
        title: title ? title : `${layer.title} (${index + 1})`,
        projection:
          queryDataSource.options.type === 'carto'
            ? 'EPSG:4326'
            : options.projection
      });
    });
  }

  private extractGML2Data(res, zIndex, allowedFieldsAndAlias?) {
    let parser = new olFormatGML2();
    let features = parser.readFeatures(res);

    // Handle non standard GML output (MapServer)
    if (features.length === 0) {
      parser = new olformat.WMSGetFeatureInfo();
      features = parser.readFeatures(res);
    }

    return features.map(feature => this.featureToResult(feature, zIndex, allowedFieldsAndAlias));
  }

  private extractGML3Data(res, zIndex, allowedFieldsAndAlias?) {
    const parser = new olFormatGML3();
    const features = parser.readFeatures(res);

    return features.map(feature => this.featureToResult(feature, zIndex, allowedFieldsAndAlias));
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

  private extractEsriJSONData(res, zIndex) {
    const parser = new olFormatEsriJSON();
    const features = parser.readFeatures(res);

    return features.map(feature => this.featureToResult(feature, zIndex));
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
    let threshold =
      (Math.abs(parseFloat(bbox[0])) - Math.abs(parseFloat(bbox[2]))) * 0.1;

    // for context in degree (EPSG:4326,4269...)
    if (Math.abs(parseFloat(bbox[0])) < 180) {
      threshold = 0.045;
    }

    const clickx =
      parseFloat(bbox[0]) +
      (Math.abs(parseFloat(bbox[0]) - parseFloat(bbox[2])) * xPosition) /
        width -
      threshold;
    const clicky =
      parseFloat(bbox[1]) +
      (Math.abs(parseFloat(bbox[1]) - parseFloat(bbox[3])) * yPosition) /
        height -
      threshold;
    const clickx1 = clickx + threshold * 2;
    const clicky1 = clicky + threshold * 2;

    const wktPoly =
      'POLYGON((' +
      clickx +
      ' ' +
      clicky +
      ', ' +
      clickx +
      ' ' +
      clicky1 +
      ', ' +
      clickx1 +
      ' ' +
      clicky1 +
      ', ' +
      clickx1 +
      ' ' +
      clicky +
      ', ' +
      clickx +
      ' ' +
      clicky +
      '))';

    const format = new olformat.WKT();
    const tenPercentWidthGeom = format.readFeature(wktPoly);
    const f = tenPercentWidthGeom.getGeometry() as any;

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
        const body = res
          .slice(bodyTagStart, bodyTagEnd)
          .replace(/(\r|\n|\s)/g, '');
        if (body === '<body></body>' || res === '') {
          return [];
        }
        break;
    }

    return [
      {
        id: uuid(),
        source: 'title',
        type: FeatureType.Feature,
        format: FeatureFormat.GeoJSON,
        title: 'title',
        icon: iconHtml,
        projection: 'EPSG:3857',
        properties: { target: targetIgo2, body: res, url: url },
        geometry: { type: f.getType(), coordinates: f.getCoordinates() }
      }
    ];
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

  private featureToResult(featureOL: olFeature, zIndex: number, allowedFieldsAndAlias?): Feature {
    const featureGeometry = featureOL.getGeometry() as any;
    const properties = Object.assign({}, featureOL.getProperties());
    delete properties['geometry'];
    delete properties['boundedBy'];
    delete properties['shape'];

    let geometry;
    if (featureGeometry !== undefined) {
      geometry = {
        type: featureGeometry.getType(),
        coordinates: featureGeometry.getCoordinates()
      };
    }

    return {
      id: uuid(),
      source: undefined,
      sourceType: SourceFeatureType.Query,
      type: FeatureType.Feature,
      order: 1000 - zIndex,
      format: FeatureFormat.GeoJSON,
      title: undefined,
      icon: 'place',
      projection: undefined,
      properties: properties,
      geometry: geometry,
      alias: allowedFieldsAndAlias
    };
  }

  private getQueryUrl(
    datasource: QueryableDataSource,
    options: QueryOptions
  ): string {
    let url;
    switch (datasource.constructor) {
      case WMSDataSource:
        const wmsDatasource = datasource as WMSDataSource;
        url = wmsDatasource.ol.getGetFeatureInfoUrl(
          options.coordinates,
          options.resolution,
          options.projection,
          {
            INFO_FORMAT:
              wmsDatasource.params.info_format ||
              this.getMimeInfoFormat(datasource.options.queryFormat),
            QUERY_LAYERS: wmsDatasource.params.layers,
            FEATURE_COUNT: wmsDatasource.params.feature_count || '5'
          }
        );
        break;
      case CartoDataSource:
        const cartoDatasource = datasource as CartoDataSource;
        const baseUrl =
          'https://' +
          cartoDatasource.options.account +
          '.carto.com/api/v2/sql?';
        const format = 'format=GeoJSON';
        const sql =
          '&q=' + cartoDatasource.options.config.layers[0].options.sql;
        const clause =
          ' WHERE ST_Intersects(the_geom_webmercator,ST_BUFFER(ST_SetSRID(ST_POINT(';
        const metres = cartoDatasource.options.queryPrecision
          ? cartoDatasource.options.queryPrecision
          : '1000';
        const coordinates =
          options.coordinates[0] +
          ',' +
          options.coordinates[1] +
          '),3857),' +
          metres +
          '))';

        url = `${baseUrl}${format}${sql}${clause}${coordinates}`;
        break;
      case TileArcGISRestDataSource:
        const tileArcGISRestDatasource = datasource as TileArcGISRestDataSource;
        let extent = olextent.boundingExtent([options.coordinates]);
        if (tileArcGISRestDatasource.options.queryPrecision) {
          extent = olextent.buffer(
            extent,
            tileArcGISRestDatasource.options.queryPrecision
          );
        }
        const serviceUrl =
          tileArcGISRestDatasource.options.url +
          '/' +
          tileArcGISRestDatasource.options.layer +
          '/query/';
        const geometry = encodeURIComponent(
          '{"xmin":' +
            extent[0] +
            ',"ymin":' +
            extent[1] +
            ',"xmax":' +
            extent[2] +
            ',"ymax":' +
            extent[3] +
            ',"spatialReference":{"wkid":102100}}'
        );
        const params = [
          'f=json',
          `geometry=${geometry}`,
          'geometryType=esriGeometryEnvelope',
          'inSR=102100',
          'spatialRel=esriSpatialRelIntersects',
          'outFields=*',
          'returnGeometry=true',
          'outSR=102100'
        ];
        url = `${serviceUrl}?${params.join('&')}`;
        break;
      default:
        break;
    }

    return url;
  }

  private getMimeInfoFormat(queryFormat) {
    let mime;
    switch (queryFormat) {
      case QueryFormat.GML2:
        mime = 'application/vnd.ogc.gml';
        break;
      case QueryFormat.GML3:
        mime = 'application/vnd.ogc.gml/3.1.1';
        break;
      case QueryFormat.JSON:
        mime = 'application/json';
        break;
      case QueryFormat.GEOJSON:
        mime = 'application/geojson';
        break;
      case QueryFormat.TEXT:
        mime = 'text/plain';
        break;
      case QueryFormat.HTML:
        mime = 'text/html';
        break;
      default:
        mime = 'application/vnd.ogc.gml';
        break;
    }

    return mime;
  }
}
