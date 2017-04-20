import { FeatureType, FeatureFormat } from './feature.enum';

export interface Feature {
  id: string;
  source: string;
  type: FeatureType;
  format: FeatureFormat;
  title: string;
  title_html?: string;
  icon?: string;

  projection?: string;
  geometry?: FeatureGeometry;
  extent?: ol.Extent;
  properties?: {[key: string]: any};
}

export interface FeatureGeometry {
  type: ol.geom.GeometryType;
  coordinates: [any];
}
