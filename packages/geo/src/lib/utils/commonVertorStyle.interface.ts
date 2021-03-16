import olFeature from 'ol/Feature';
import { Feature } from '../feature/shared/feature.interfaces';

export interface FeatureCommonVectorStyleOptions extends CommonVectorStyleOptions {
  feature: Feature | olFeature;
}

export interface CommonVectorStyleOptions {
  markerColor?: string | number[];        // marker fill
  fillColor?: string | number[];          // poly
  outlineColor?: string | number[];       // marker contour
  strokeColor?: string | number[];        // line and poly
  strokeWidth?: number;
}
