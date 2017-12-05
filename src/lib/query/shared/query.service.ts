import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';

import { uuid } from '../../utils/uuid';
import { RequestService } from '../../core';
import { AuthHttp } from '../../auth';
import { Feature, FeatureType, FeatureFormat,
         FeatureService } from '../../feature';
import { DataSource, QueryableDataSource } from '../../datasource';
import { Layer } from '../../layer';

import { QueryFormat } from './query.enum';
import { QueryOptions } from './query.interface';


@Injectable()
export class QueryService {

  private subscriptions: Subscription[] = [];

  constructor(private authHttp: AuthHttp,
              private featureService: FeatureService,
              private requestService: RequestService) { }

  query(layers: Layer[], options: QueryOptions) {
    this.unsubscribe();
    this.subscriptions = layers
      .filter((layer: Layer) => layer.visible)
      .map((layer: Layer) => this.queryDataSource(layer.dataSource, options));
  }

  queryDataSource(dataSource: DataSource, options: QueryOptions) {
    const url = (dataSource as any as QueryableDataSource).getQueryUrl(options);
    const request = this.authHttp.get(url);

    this.featureService.clear();
    return this.requestService
      .register(request, dataSource.title)
      .map(res => this.extractData(res, dataSource, options))
      .subscribe((features: Feature[]) =>
        this.handleQueryResults(features, dataSource));
  }

  private unsubscribe() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  private handleQueryResults(features: Feature[], dataSource: DataSource) {
    this.featureService.updateFeatures(features, dataSource.title);
  }

  private extractData(res: Response, dataSource: DataSource,
                      options: QueryOptions): Feature[] {
    const queryDataSource = (dataSource as any as QueryableDataSource);

    let features = [];
    switch (queryDataSource.queryFormat) {
      case QueryFormat.GML2:
        features = this.extractGML2Data(res);
        break;
      case QueryFormat.GML3:
        features = this.extractGML3Data(res);
        break;
      case QueryFormat.JSON:
        features = this.extractGeoJSONData(res);
        break;
      case QueryFormat.TEXT:
        features = this.extractTextData(res);
        break;
      case QueryFormat.HTML:
        features = this.extractHtmlData(res, queryDataSource.queryHtmlTarget);
        break;
      default:
        break;
    }

    return features.map((feature: Feature, index: number) => {
      const title = feature.properties[queryDataSource.queryTitle];

      return Object.assign(feature, {
        id: uuid(),
        source: dataSource.title,
        title: title ? title : `${dataSource.title} (${index + 1})`,
        projection: options.projection
      });
    });
  }

  private extractGML2Data(res: Response) {
    let parser = new ol.format.GML2();
    let features = parser.readFeatures(res.text());

    // Handle non standard GML output (MapServer)
    if (features.length === 0) {
      parser = new ol.format.WMSGetFeatureInfo();
      features = parser.readFeatures(res.text());
    }

    return features.map(feature => this.featureToResult(feature));
  }

  private extractGML3Data(res: Response) {
    const parser = new ol.format.GML3();
    const features = parser.readFeatures(res.text());

    return features.map(feature => this.featureToResult(feature));
  }

  private extractGeoJSONData(res: Response) {
    return res.json().features;
  }

  private extractTextData(res: Response) {
    // TODO
    return [];
  }

  private extractHtmlData(res: Response, html_target) {
      // _blank , modal , innerhtml or undefined
      const searchParams = new URLSearchParams(res['url'].toLowerCase());
      const bbox_raw = searchParams.get('bbox');
      const width = parseInt(searchParams.get('width'), 10);
      const height = parseInt(searchParams.get('height'), 10);
      const wms_version = searchParams.get('version');
      let x_position;
      let y_position;

      if (wms_version === '1.3.0') {
        x_position = parseInt(searchParams.get('i'), 10);
        y_position = parseInt(searchParams.get('j'), 10);
      } else {
        x_position = parseInt(searchParams.get('x'), 10);
        y_position = parseInt(searchParams.get('y'), 10);
      }

      const bbox = bbox_raw.split(',');
      let threshold = (Math.abs(parseFloat(bbox[0])) - Math.abs(parseFloat(bbox[2]))) * (0.1);

      // for context in degree (EPSG:4326,4269...)
      if (Math.abs(parseFloat(bbox[0])) < 180) {
         threshold = 0.045;
      }

      const clickx = parseFloat(bbox[0]) + Math.abs(parseFloat(bbox[0]) - parseFloat(bbox[2]))
                    * x_position / width - threshold;
      const clicky = parseFloat(bbox[1]) + Math.abs(parseFloat(bbox[1]) - parseFloat(bbox[3]))
                    * y_position / height - threshold;
      const clickx1 = clickx + threshold * 2;
      const clicky1 = clicky + threshold * 2;

      const wkt_poly = 'POLYGON((' + clickx + ' ' + clicky + ', ' + clickx + ' ' + clicky1 +
                  ', ' + clickx1 + ' ' + clicky1 + ', ' + clickx1 + ' ' + clicky +
                  ', ' + clickx + ' ' + clicky + '))';


      const format = new ol.format.WKT();
      const tenPercentWidthGeom = format.readFeature(wkt_poly);
      const f = (tenPercentWidthGeom.getGeometry() as any);

      let target_igo2 = '_blank';
      let icon_html = 'link';

      switch (html_target) {
        case 'newtab':
          target_igo2 = '_blank';
          break;
        case 'modal':
          target_igo2 = 'modal';
          icon_html = 'place';
          break;
        case 'innerhtml':
          target_igo2 = 'innerhtml';
          icon_html = 'place';
          const body_tag_start = res['_body'].toLowerCase().indexOf('<body>');
          const body_tag_end = res['_body'].toLowerCase().lastIndexOf('</body>') + 7;
          if ( res['_body'].slice(body_tag_start, body_tag_end) === '<body></body>') {
            return [];
          }
          res['_body'] = res['_body'];
          break;
        }


      return [{
        id: 'html1',
        source: 'title',
        type: FeatureType.Feature,
        format: FeatureFormat.GeoJSON,
        title: 'title',
        icon: icon_html,
        projection: 'EPSG:3857',
        properties: {target: target_igo2, body: res['_body'], url: res['url']},
        geometry: {type: f.getType(), coordinates: f.getCoordinates()}
      }];
  }

  private featureToResult(feature: ol.Feature): Feature {
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
      type: FeatureType.Feature,
      format: FeatureFormat.GeoJSON,
      title: undefined,
      icon: 'place',
      projection: undefined,
      properties: properties,
      geometry: geometry
    };
  }
}
