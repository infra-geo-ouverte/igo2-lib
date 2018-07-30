import { GeoJsonGeometryTypes } from 'geojson';
import { AnyDataSourceOptions } from '../../datasource';

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
  extent?: ol.Extent;
  properties?: { [key: string]: any };
  layer?: AnyDataSourceOptions;
}

export interface FeatureGeometry {
  type: GeoJsonGeometryTypes;
  coordinates: any;
}
