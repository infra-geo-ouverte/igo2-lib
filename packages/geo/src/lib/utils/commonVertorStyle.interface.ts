import olFeature from 'ol/Feature';
import { Feature } from '../feature/shared/feature.interfaces';

export interface FeatureCommonVectorStyleOptions extends CommonVectorStyleOptions {
  feature: Feature | olFeature;
}

export interface CommonVectorStyleOptions {
  markerColor?: string | number[];        // marker fill
  markerOpacity?: number;                 // marker opacity, applied only if a rgb is provided
  markerOutlineColor?: string | number[]; // marker contour
  fillColor?: string | number[];          // poly
  fillOpacity?: number;                   // poly fill opacity, applied only if a rgb is provided
  strokeColor?: string | number[];        // line and poly
  strokeOpacity?: number;                 // line and poly, applied only if a rgb is provided
  strokeWidth?: number;
}
