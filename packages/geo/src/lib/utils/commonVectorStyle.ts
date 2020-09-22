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
export function getSelectedMarkerStyle(feature: Feature | olFeature): olstyle.Style {

  const baseColor = [0, 255, 255];
  const strokeWidth = 4;

  const isOlFeature = feature instanceof olFeature;
  const geometry = isOlFeature ? feature.getGeometry() : feature.geometry;
  const geometryType = isOlFeature ? geometry.getType() : geometry.type;

  if (!geometry || geometryType === 'Point') {
    return createOverlayMarkerStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      outlineColor: baseColor
    });
  } else {
    return createOverlayDefaultStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      strokeWidth,
      strokeColor: baseColor
    });
  }
}

/**
 * Generate a basic style for features
 * @param feature The feature to generate the style
 * @returns A olStyle
 */
export function getMarkerStyle(feature: Feature | olFeature): olstyle.Style {

  const baseColor = [0, 255, 255];

  const isOlFeature = feature instanceof olFeature;
  const geometry = isOlFeature ? feature.getGeometry() : feature.geometry;
  const geometryType = isOlFeature ? geometry.getType() : geometry.type;

  if (!geometry || geometryType === 'Point') {
    return createOverlayMarkerStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      opacity: 0.5,
      outlineColor: baseColor
    });
  } else if (
    geometryType === 'LineString' ||
    geometryType === 'MultiLineString'
  ) {
    return createOverlayDefaultStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      strokeOpacity: 0.5,
      strokeColor: baseColor
    });
  } else {
    return createOverlayDefaultStyle({
      text: isOlFeature ? undefined : feature.meta.mapTitle,
      fillOpacity: 0.15,
      strokeColor: baseColor
    });
  }
}
