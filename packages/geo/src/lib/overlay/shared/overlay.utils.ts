import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';
import { asArray as ColorAsArray } from 'ol/color';

import { FeatureDataSource } from '../../datasource';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { StyleService } from '../../layer/shared/style.service';
import { createOverlayMarkerStyle } from './overlay-marker-style.utils';
import type { default as OlGeometry } from 'ol/geom/Geometry';

/**
 * Create an overlay layer and it's source
 * @returns Overlay layer
 */
export function createOverlayLayer(): VectorLayer {
  const overlayDataSource = new FeatureDataSource();
  return new VectorLayer({
    title: 'Overlay',
    zIndex: 300,
    source: overlayDataSource,
    style: createOverlayLayerStyle()
  });
}

/**
 * Create an overlay style with markers for points and a basic stroke/fill
 * combination for lines and polygons
 * @returns Style function
 */
function createOverlayLayerStyle(): (olFeature: OlFeature<OlGeometry>) => olstyle.Style {
  const defaultStyle = createOverlayDefaultStyle();
  const markerStyle = createOverlayMarkerStyle();

  let style;

  return (olFeature: OlFeature<OlGeometry>) => {
      const customStyle = olFeature.get('_style');
      if (customStyle) {
        const styleService = new StyleService();
        return styleService.createStyle(customStyle);
      }
      const geometryType = olFeature.getGeometry().getType();
      style = geometryType === 'Point' ? markerStyle : defaultStyle;
      style.getText().setText(olFeature.get('_mapTitle'));
      return style;
  };
}

/**
 * Create a basic style for lines and polygons
 * @returns Style
 */
export function createOverlayDefaultStyle({
  text,
  strokeWidth = 2,
  fillColor = [0, 161, 222, 0.3],
  strokeColor = [0, 161, 222, 0.9],
}: {
  text?: string;
  strokeWidth?: number;
  fillColor?: string | number[];
  strokeColor?: string | number[];
} = {}): olstyle.Style {
  const fillWithOpacity = ColorAsArray(fillColor).slice(0);
  const strokeWithOpacity = ColorAsArray(strokeColor).slice(0);

  const stroke = new olstyle.Stroke({
    width: strokeWidth,
    color: strokeWithOpacity
  });

  const fill = new olstyle.Fill({
    color: fillWithOpacity
  });

  return new olstyle.Style({
    stroke,
    fill,
    image: new olstyle.Circle({
      radius: 5,
      stroke,
      fill
    }),
    text: new olstyle.Text({
      text,
      font: '12px Calibri,sans-serif',
      fill: new olstyle.Fill({ color: '#000' }),
      stroke: new olstyle.Stroke({ color: '#fff', width: 3 }),
      overflow: true
    })
  });
}
