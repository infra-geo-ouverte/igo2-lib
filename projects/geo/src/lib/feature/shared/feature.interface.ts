import { GeoJsonGeometryTypes } from 'geojson';
import { AnyLayerOptions } from '../../layer';

import { FeatureType, FeatureFormat, SourceFeatureType } from './feature.enum';

export interface Feature {
  id: string;
  source: string;
  sourceType?: SourceFeatureType;
  order?: number;
  type: FeatureType;
  title: string;
  format?: FeatureFormat;
  title_html?: string;
  icon?: string;

  projection?: string;
  geometry?: FeatureGeometry;
  extent?: [number, number, number, number];
  properties?: { [key: string]: any };
  layer?: AnyLayerOptions;
}

export interface FeatureGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: any;
}
