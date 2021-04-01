import olFeature from 'ol/Feature';
import { Feature } from '../feature/shared/feature.interfaces';

export interface FeatureCommonVectorStyleOptions extends CommonVectorStyleOptions {
  feature: Feature | olFeature;
}

export interface CommonVectorStyleOptions {
  markerColor?: string | number[];        // marker fill
  markerOutlineColor?: string | number[]; // marker contour
  fillColor?: string | number[];          // poly
  strokeColor?: string | number[];        // line and poly
  strokeWidth?: number;
}
