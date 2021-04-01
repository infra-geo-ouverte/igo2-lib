import * as olstyle from 'ol/style';
import olFeature from 'ol/Feature';
import { asArray as ColorAsArray } from 'ol/color';

import { createOverlayMarkerStyle } from '../overlay/shared/overlay-marker-style.utils';
import { createOverlayDefaultStyle } from '../overlay/shared/overlay.utils';
import { FeatureCommonVectorStyleOptions } from './commonVertorStyle.interface';


/**
 * Generate a style for selected features
 * @param feature The feature to generate the style
 * @returns A olStyle
 */
export function getCommonVectorSelectedStyle(
  {
    feature,
    markerColor = '#00a1de',
    markerOutlineColor,
    fillColor,
    strokeColor = [0, 255, 255],
    strokeWidth = 4
  }: FeatureCommonVectorStyleOptions): olstyle.Style {

  const isOlFeature = feature instanceof olFeature;
  const geometry = isOlFeature ? feature.getGeometry() : feature.geometry;
  const geometryType = isOlFeature ? geometry.getType() : geometry.type;

  if (!geometry || geometryType === 'Point') {
    return createOverlayMarkerStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      markerOutlineColor,
      markerColor
    });
  } else {
    return createOverlayDefaultStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      strokeWidth,
      strokeColor,
      fillColor
    });
  }
}

/**
 * Generate a basic style for features
 * @param feature The feature to generate the style
 * @returns A olStyle
 */
export function getCommonVectorStyle(
  {
    feature,
    markerColor = '#00a1de',
    markerOutlineColor = [0, 255, 255],
    fillColor = [0, 255, 255],
    strokeColor = [0, 255, 255],
    strokeWidth = 2
  }: FeatureCommonVectorStyleOptions): olstyle.Style {

  const isOlFeature = feature instanceof olFeature;
  const geometry = isOlFeature ? feature.getGeometry() : feature.geometry;
  const geometryType = isOlFeature ? geometry.getType() : geometry.type;

  if (!geometry || geometryType === 'Point') {
    return createOverlayMarkerStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      opacity: 0.5,
      markerOutlineColor,
      markerColor
    });
  } else {
    const fillWithOpacity = ColorAsArray(fillColor).slice(0);
    const strokeWithOpacity = ColorAsArray(strokeColor).slice(0);
    fillWithOpacity[3] = 0.15;
    strokeWithOpacity[3] = 0.5;
    return createOverlayDefaultStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      strokeWidth,
      strokeColor: strokeWithOpacity,
      fillColor: fillWithOpacity
    });
  }
}
