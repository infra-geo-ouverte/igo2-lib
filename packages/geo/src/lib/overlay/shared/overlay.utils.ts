import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';

import { FeatureDataSource } from '../../datasource';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { StyleService } from '../../layer/shared/style.service';
import { createOverlayMarkerStyle } from './overlay-marker-style.utils';

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
function createOverlayLayerStyle(): (olFeature: OlFeature) => olstyle.Style {
  const defaultStyle = createOverlayDefaultStyle();
  const markerStyle = createOverlayMarkerStyle();

  let style;

  return (olFeature: OlFeature) => {
    if (olFeature.getId() === 'bufferFeature') {
      style = createBufferStyle(
        olFeature.get('bufferStroke'),
        2,
        olFeature.get('bufferFill'),
        olFeature.get('bufferText')
      );
      return style;
    } else {
      const customStyle = olFeature.get('_style');
      if (customStyle) {
        const styleService = new StyleService();
        return styleService.createStyle(customStyle);
      }
      const geometryType = olFeature.getGeometry().getType();
      style = geometryType === 'Point' ? markerStyle : defaultStyle;
      style.getText().setText(olFeature.get('_mapTitle'));
      return style;
    }
  };
}

/**
 * Create a basic style for lines and polygons
 * @returns Style
 */
export function createOverlayDefaultStyle({
  text,
  fillOpacity,
  strokeWidth = 2,
  strokeOpacity,
  color = [0, 161, 222, 0.3],
  strokeColor
}: {
  text?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  strokeOpacity?: number;
  color?: number[];
  strokeColor?: number[];
} = {}): olstyle.Style {
  const fillWithOpacity = color.slice(0);
  const strokeWithOpacity = color.slice(0);
  strokeWithOpacity[3] = 1;
  if (fillOpacity) {
    fillWithOpacity[3] = fillOpacity;
  }
  if (strokeOpacity) {
    strokeWithOpacity[3] = strokeOpacity;
  }
  if (strokeColor) {
    strokeWithOpacity[0] = strokeColor[0];
    strokeWithOpacity[1] = strokeColor[1];
    strokeWithOpacity[2] = strokeColor[2];
  }

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

function createBufferStyle(
  strokeRGBA: [number, number, number, number] = [0, 161, 222, 1],
  strokeWidth: number = 2,
  fillRGBA: [number, number, number, number] = [0, 161, 222, 0.15],
  bufferRadius?
): olstyle.Style {
  const stroke = new olstyle.Stroke({
    width: strokeWidth,
    color: strokeRGBA
  });

  const fill = new olstyle.Stroke({
    color: fillRGBA
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
      font: '12px Calibri,sans-serif',
      text: bufferRadius,
      fill: new olstyle.Fill({ color: '#000' }),
      stroke: new olstyle.Stroke({ color: '#fff', width: 3 }),
      overflow: true
    })
  });
}
