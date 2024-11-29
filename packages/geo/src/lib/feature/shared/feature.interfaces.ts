import { UntypedFormGroup } from '@angular/forms';

import {
  EntityKey,
  EntityStoreOptions,
  EntityStoreStrategyOptions
} from '@igo2/common/entity';

import OlFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import OlRenderFeature from 'ol/render/Feature';

import { GeoJsonGeometryTypes } from 'geojson';

import { SourceFieldsOptionsParams } from '../../datasource/shared/datasources';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import type { IgoMap } from '../../map/shared/map';
import { FeatureMotion } from './feature.enums';

export interface Feature<P = Record<string, any>> {
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
  style?: Record<string, any>;
  alias?: Record<string, string>;
  revision?: number;
  excludeAttribute?: string[];
  excludeAttributeOffline?: string[];
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

/** @deprecated use FeatureStoreStrategyOptions*/
export type FeatureStoreInMapExtentStrategyOptions =
  FeatureStoreStrategyOptions;

/** @deprecated use FeatureStoreStrategyOptions*/
export type FeatureStoreInMapResolutionStrategyOptions =
  FeatureStoreStrategyOptions;

/** @deprecated use FeatureStoreStrategyOptions*/
export type FeatureStoreLoadingLayerStrategyOptions =
  FeatureStoreStrategyOptions;

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
