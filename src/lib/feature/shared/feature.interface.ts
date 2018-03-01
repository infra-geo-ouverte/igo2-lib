import { AnyDataSourceContext } from '../../datasource';

import { FeatureType, FeatureFormat, SourceFeatureType } from './feature.enum';

export interface Feature {
  id: string;
  source: string;
  sourceType?: SourceFeatureType;
  type: FeatureType;
  title: string;
  format?: FeatureFormat;
  title_html?: string;
  icon?: string;

  projection?: string;
  geometry?: FeatureGeometry;
  extent?: ol.Extent;
  properties?: {[key: string]: any};
  layer?: AnyDataSourceContext;
}

export interface FeatureGeometry {
  type: ol.geom.GeometryType;
  coordinates: [any];
}
