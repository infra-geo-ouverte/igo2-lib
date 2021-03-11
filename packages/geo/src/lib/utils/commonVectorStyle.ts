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
    pinColor = 'blue',
    outlineColor = [0, 255, 255],
    strokeColor = [0, 255, 255],
    fillColor,
    strokeWidth = 4
  }: {
    feature?: Feature | olFeature,
    pinColor?: string;
    outlineColor?: number[];
    strokeColor?: number[];
    fillColor?: number[];
    strokeWidth?: number;
  } = {}): olstyle.Style {


  const isOlFeature = feature instanceof olFeature;
  const geometry = isOlFeature ? feature.getGeometry() : feature.geometry;
  const geometryType = isOlFeature ? geometry.getType() : geometry.type;

  if (!geometry || geometryType === 'Point') {
    return createOverlayMarkerStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      outlineColor,
      color: pinColor,
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
    currentZoom,
    pinColor = 'blue',
    outlineColor = [0, 255, 255],
    strokeColor = [0, 255, 255]
  }: {
    feature?: Feature | olFeature,
    currentZoom?: number,
    pinColor?: string;
    outlineColor?: number[];
    strokeColor?: number[];
  } = {}): olstyle.Style {

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
      strokeWidth: currentZoom && currentZoom < 11 ? 5 : undefined,
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      strokeOpacity: 0.5,
      strokeColor
    });
  } else {
    return createOverlayDefaultStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      fillOpacity: 0.15,
      strokeColor
    });
  }
}
