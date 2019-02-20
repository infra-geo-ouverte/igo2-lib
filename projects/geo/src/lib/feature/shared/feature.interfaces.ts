import { FormGroup } from '@angular/forms';

import * as olstyle from 'ol/style';

import { GeoJsonGeometryTypes } from 'geojson';

import { EntityKey, EntityStoreOptions } from '@igo2/common';
import { IgoMap } from '../../map';
import { FeatureMotion } from './feature.enums';

export interface Feature<P = {[key: string]: any}> {
  type: string;
  projection: string;
  geometry: FeatureGeometry;
  properties: P;
  extent?: [number, number, number, number];
  meta?: FeatureMeta;
}

export interface FeatureMeta {
  id: EntityKey;
  title?: string;
  mapTitle?: string;
  order?: number;
  alias: {[key: string]: string};
}

export interface FeatureGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: any;
}

export interface FeatureStoreOptions extends EntityStoreOptions {
  map: IgoMap;
}

export interface FeatureStoreSelectionStrategyOptions {
  map: IgoMap;
  motion?: FeatureMotion;
  style?: olstyle.Style;
  many?: boolean;
}

export interface FeatureFormSubmitEvent {
  form: FormGroup;
  feature: Feature | undefined;
  data: Feature;
}
