import { isValidJSON } from '@igo2/utils';

import olFeature from 'ol/Feature';
import * as olGeom from 'ol/geom';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as olStyle from 'ol/style';

import { StyleService } from '../../style-service/style.service';

export function featureRandomStyleFunction(): (
  olFeature: olFeature<OlGeometry>,
  resolution: number
) => olStyle.Style {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  const stroke = new olStyle.Stroke({
    color: [r, g, b, 1],
    width: 2
  });
  const fill = new olStyle.Fill({
    color: [r, g, b, 0.4]
  });
  return (olFeature: olFeature<OlGeometry>, resolution: number) => {
    const customStyle = olFeature.get('_style');
    if (customStyle && isValidJSON(customStyle)) {
      if (
        customStyle.circle &&
        olFeature.get('rad') &&
        olFeature.get('longitude') &&
        olFeature.get('latitude')
      ) {
        const lonLat: [number, number] = [
          olFeature.get('longitude'),
          olFeature.get('latitude')
        ];
        const radius =
          olFeature.get('rad') /
          Math.cos((Math.PI / 180) * lonLat[1]) /
          resolution;
        customStyle.circle.radius = radius;
      }
      const styleService = new StyleService();
      return styleService.createStyle(customStyle, undefined, resolution);
    }
    const style = new olStyle.Style({
      stroke,
      fill,
      image: new olStyle.Circle({
        radius: 5,
        stroke,
        fill
      }),
      text: olFeature.get('_mapTitle')
        ? new olStyle.Text({
            text: olFeature.get('_mapTitle').toString(),
            offsetX: 5,
            offsetY: -5,
            font: '12px Calibri,sans-serif',
            fill: new olStyle.Fill({ color: '#000' }),
            stroke: new olStyle.Stroke({ color: '#fff', width: 3 }),
            overflow: true
          })
        : undefined
    });
    return style;
  };
}

export function featureRandomStyle(): olStyle.Style {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  const stroke = new olStyle.Stroke({
    color: [r, g, b, 1],
    width: 2
  });
  const fill = new olStyle.Fill({
    color: [r, g, b, 0.4]
  });

  const style = new olStyle.Style({
    stroke,
    fill,
    image: new olStyle.Circle({
      radius: 5,
      stroke,
      fill
    })
  });
  return style;
}

/**
 * Create a default style for the pointer position and it's label summary.
 * @param feature olFeature
 * @returns OL style function
 */
export function hoverFeatureMarkerStyle(
  feature: olFeature<olGeom.Geometry>
): olStyle.Style[] {
  const olStyleText = new olStyle.Style({
    text: new olStyle.Text({
      text: feature.get('hoverSummary'),
      textAlign: 'left',
      textBaseline: 'top',
      font: '12px Calibri,sans-serif',
      fill: new olStyle.Fill({ color: '#000' }),
      backgroundFill: new olStyle.Fill({ color: 'rgba(255, 255, 255, 0.5)' }),
      backgroundStroke: new olStyle.Stroke({
        color: 'rgba(200, 200, 200, 0.75)',
        width: 2
      }),
      stroke: new olStyle.Stroke({ color: '#fff', width: 3 }),
      overflow: true,
      offsetX: 10,
      offsetY: 20,
      padding: [2.5, 2.5, 2.5, 2.5]
    })
  });
  const olStyles = [olStyleText];
  switch (feature.getGeometry().getType()) {
    case 'Point':
      olStyles.push(
        new olStyle.Style({
          image: new olStyle.Circle({
            radius: 10,
            stroke: new olStyle.Stroke({
              color: 'blue',
              width: 3
            })
          })
        })
      );
      break;
    default:
      olStyles.push(
        new olStyle.Style({
          stroke: new olStyle.Stroke({
            color: 'white',
            width: 5
          })
        })
      );
      olStyles.push(
        new olStyle.Style({
          stroke: new olStyle.Stroke({
            color: 'blue',
            width: 3
          })
        })
      );
  }

  return olStyles;
}

/**
 * Create a default style for the pointer position and it's label summary.
 * @param feature olFeature
 * @returns OL style function
 */
export function pointerPositionSummaryMarkerStyle(
  feature: olFeature<OlGeometry>
): olStyle.Style {
  return new olStyle.Style({
    image: new olStyle.Icon({
      src: './assets/igo2/geo/icons/cross_black_18px.svg'
    }),

    text: new olStyle.Text({
      text: feature.get('pointerSummary'),
      textAlign: 'left',
      textBaseline: 'bottom',
      font: '12px Calibri,sans-serif',
      fill: new olStyle.Fill({ color: '#000' }),
      backgroundFill: new olStyle.Fill({ color: 'rgba(255, 255, 255, 0.5)' }),
      backgroundStroke: new olStyle.Stroke({
        color: 'rgba(200, 200, 200, 0.75)',
        width: 2
      }),
      stroke: new olStyle.Stroke({ color: '#fff', width: 3 }),
      overflow: true,
      offsetX: 10,
      offsetY: -10,
      padding: [2.5, 2.5, 2.5, 2.5]
    })
  });
}
