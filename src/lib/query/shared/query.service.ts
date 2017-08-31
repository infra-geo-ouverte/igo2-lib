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

  private featureToResult(feature: ol.Feature): Feature {
    const featureGeometry = (feature.getGeometry() as any);
    const properties = Object.assign({}, feature.getProperties());
    delete properties['geometry'];

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
