import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';

import { RequestService } from '../../core';
import { Feature, FeatureType, FeatureFormat,
         FeatureService } from '../../feature';

import { Layer, QueryableLayer } from '../../layer';

export enum QueryFormat {
  GML2 = 'gml2' as any,
  GML3 = 'gml3' as any,
  JSON = 'json' as any,
  TEXT = 'text' as any
}

@Injectable()
export class QueryService {

  private subscriptions: Subscription[] = [];

  constructor(private http: Http,
              private featureService: FeatureService,
              private requestService: RequestService) { }

  query(layers: Layer[], coordinates: [number, number]) {
    this.unsubscribe();
    this.subscriptions = layers.map((layer: Layer) =>
      this.queryLayer(layer, coordinates));
  }

  queryLayer(layer: Layer, coordinates: [number, number]) {
    const request = this.http.get(
      (layer as any as QueryableLayer).getQueryUrl(coordinates));

    return this.requestService
      .register(request, layer.title)
      .map(res => this.extractData(res, layer))
      .subscribe((features: Feature[]) =>
        this.handleQueryResults(features, layer));
  }

  private unsubscribe() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  private handleQueryResults(features: Feature[], layer: Layer) {
    this.featureService.updateFeatures(features, layer.title);
  }

  private extractData(res: Response, layer: Layer): Feature[] {
    const queryLayer = (layer as any as QueryableLayer);

    let features = [];
    switch (queryLayer.queryFormat) {
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
      const title = feature.properties[queryLayer.queryTitle];

      return Object.assign(feature, {
        source: layer.title,
        title: title ? title : `${layer.title} (${index + 1})`,
        projection: layer.map.projection
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
