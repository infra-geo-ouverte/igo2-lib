import { UntypedFormGroup } from '@angular/forms';

import {
  EntityKey,
  EntityStoreOptions,
  EntityStoreStrategyOptions
} from '@igo2/common';

import OlFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import OlRenderFeature from 'ol/render/Feature';

import { GeoJsonGeometryTypes } from 'geojson';

import { SourceFieldsOptionsParams } from '../../datasource';
import { VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared';
import { FeatureMotion } from './feature.enums';

export interface Feature<P = { [key: string]: any }> {
  type: string;
  projection?: string;
  geometry?: FeatureGeometry;
  properties: P;
  extent?: [number, number, number, number];
  meta?: FeatureMeta;
  ol?: OlFeature<OlGeometry> | OlRenderFeature;
  sourceId?: string;
}

export interface FeatureMeta {
  id: EntityKey;
  title?: string;
  mapTitle?: string;
  sourceTitle?: string;
  order?: number;
  icon?: string;
  style?: { [key: string]: any };
  alias?: { [key: string]: string };
  revision?: number;
  excludeAttribute?: Array<string>;
  excludeAttributeOffline?: Array<string>;
}

export interface FeatureGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: any;
}

export interface FeatureStoreOptions extends EntityStoreOptions {
  map: IgoMap;
  layer?: VectorLayer;
}

export interface FeatureStoreStrategyOptions
  extends EntityStoreStrategyOptions {
  // When the store moves features into view, the view extent, which is also the features extent,
  // is scaled by those factors, effectively resulting in a decentered view or a more zoomed in/out view.
  // These factors are applied to the top, right, bottom and left directions, in that order.
  // A factor of 1 means the distance from the center, in that direction, is doubled.
  viewScale?: [number, number, number, number];
  // Features extent to view extent ratio used to determine if the store should trigger
  // a map zoom when features are added to it.
  areaRatio?: number;
}

export interface FeatureStoreLoadingStrategyOptions
  extends FeatureStoreStrategyOptions {
  getFeatureId?: (Feature) => EntityKey;
  motion?: FeatureMotion;
}

export interface FeatureStorePropertyTypeStrategyOptions
  extends FeatureStoreStrategyOptions {
  map: IgoMap;
}
export interface FeatureStoreInMapExtentStrategyOptions
  extends FeatureStoreStrategyOptions {}

export interface FeatureStoreInMapResolutionStrategyOptions
  extends FeatureStoreStrategyOptions {}

export interface FeatureStoreLoadingLayerStrategyOptions
  extends FeatureStoreStrategyOptions {}

export interface FeatureStoreSearchIndexStrategyOptions
  extends EntityStoreStrategyOptions {
  sourceFields?: SourceFieldsOptionsParams[];
  percentDistinctValueRatio?: number;
}

export interface FeatureStoreSelectionStrategyOptions
  extends FeatureStoreStrategyOptions {
  map: IgoMap;
  getFeatureId?: (Feature) => EntityKey;
  motion?: FeatureMotion;
  layer?: VectorLayer;
  many?: boolean;
  hitTolerance?: number;
  dragBox?: boolean;
}

export interface FeatureFormSubmitEvent {
  form: UntypedFormGroup;
  feature: Feature | undefined;
  data: Feature;
}
