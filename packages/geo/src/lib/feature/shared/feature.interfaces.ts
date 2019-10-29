import { FormGroup } from '@angular/forms';

import { GeoJsonGeometryTypes } from 'geojson';

import { EntityKey, EntityStoreOptions } from '@igo2/common';

import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { FeatureMotion } from './feature.enums';
import OlFeature from 'ol/Feature';

export interface Feature<P = {[key: string]: any}> {
  type: string;
  projection?: string;
  geometry?: FeatureGeometry;
  properties: P;
  extent?: [number, number, number, number];
  meta?: FeatureMeta;
  ol?: OlFeature;
}

export interface FeatureMeta {
  id: EntityKey;
  title?: string;
  mapTitle?: string;
  sourceTitle?: string;
  order?: number;
  alias?: {[key: string]: string};
  revision?: number;
}

export interface FeatureGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: any;
}

export interface FeatureStoreOptions extends EntityStoreOptions {
  map: IgoMap;
  layer?: VectorLayer;
}

export interface FeatureStoreStrategyOptions {
  // When the store moves features into view, the view extent, which is also the features extent,
  // is scaled by those factors, effectively resulting in a decentered view or a more zoomed in/out view.
  // These factors are applied to the top, right, bottom and left directions, in that order.
  // A factor of 1 means the distance from the center, in that direction, is doubled.
  viewScale?: [number, number, number, number];
  // Features extent to view extent ratio used to determine if the store should trigger
  // a map zoom when features are added to it.
  areaRatio?: number;
}

export interface FeatureStoreLoadingStrategyOptions extends FeatureStoreStrategyOptions {
  getFeatureId?: (Feature) => EntityKey;
  motion?: FeatureMotion;
}

export interface FeatureStoreLoadingLayerStrategyOptions extends FeatureStoreStrategyOptions {}

export interface FeatureStoreSelectionStrategyOptions extends FeatureStoreStrategyOptions {
  map: IgoMap;
  getFeatureId?: (Feature) => EntityKey;
  motion?: FeatureMotion;
  layer?: VectorLayer;
  many?: boolean;
  hitTolerance?: number;
  dragBox?: boolean;
}

export interface FeatureFormSubmitEvent {
  form: FormGroup;
  feature: Feature | undefined;
  data: Feature;
}
