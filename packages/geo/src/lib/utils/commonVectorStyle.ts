import * as olstyle from 'ol/style';
import olFeature from 'ol/Feature';

import { Feature } from '../feature/shared/feature.interfaces';
import { createOverlayMarkerStyle } from '../overlay/shared/overlay-marker-style.utils';
import { createOverlayDefaultStyle } from '../overlay/shared/overlay.utils';


/**
 * Generate a style for selected features
 * @param feature The feature to generate the style
 * @returns A olStyle
 */
export function getSelectedMarkerStyle(
  {
    feature,
    pinColor = '#00A1DE',
    fillColor,
    outlineColor = [0, 255, 255],
    strokeColor = [0, 255, 255],
    strokeWidth = 4
  }: {
    feature?: Feature | olFeature,
    pinColor?: string | number[];
    fillColor?: string | number[];
    outlineColor?: string | number[];
    strokeColor?: string | number[];
    strokeWidth?: number;

  }): olstyle.Style {

  const isOlFeature = feature instanceof olFeature;
  const geometry = isOlFeature ? feature.getGeometry() : feature.geometry;
  const geometryType = isOlFeature ? geometry.getType() : geometry.type;

  if (!geometry || geometryType === 'Point') {
    return createOverlayMarkerStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      outlineColor,
      color: pinColor
    });
  } else {
    return createOverlayDefaultStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      strokeWidth,
      strokeColor,
      color: fillColor
    });
  }
}

/**
 * Generate a basic style for features
 * @param feature The feature to generate the style
 * @returns A olStyle
 */
export function getMarkerStyle(
  {
    feature,
    pinColor = '#00A1DE',
    fillColor,
    outlineColor = [0, 255, 255],
    strokeColor = [0, 255, 255],
    strokeWidth = 2
  }: {
    feature?: Feature | olFeature,
    pinColor?: string | number[];
    fillColor?: string | number[];
    outlineColor?: string | number[];
    strokeColor?: string | number[];
    strokeWidth?: number;

  }): olstyle.Style {

  const isOlFeature = feature instanceof olFeature;
  const geometry = isOlFeature ? feature.getGeometry() : feature.geometry;
  const geometryType = isOlFeature ? geometry.getType() : geometry.type;

  if (!geometry || geometryType === 'Point') {
    return createOverlayMarkerStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      opacity: 0.5,
      outlineColor,
      color: pinColor
    });
  } else if (
    geometryType === 'LineString' ||
    geometryType === 'MultiLineString'
  ) {
    return createOverlayDefaultStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      strokeOpacity: 0.5,
      strokeWidth,
      strokeColor,
      color: fillColor
    });
  } else {
    return createOverlayDefaultStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      fillOpacity: 0.15,
      strokeWidth,
      strokeColor,
      color: fillColor
    });
  }
}
