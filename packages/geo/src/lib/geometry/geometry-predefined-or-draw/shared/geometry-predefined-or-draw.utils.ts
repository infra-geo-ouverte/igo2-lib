
import olFeature from 'ol/Feature';
import * as olStyle from 'ol/style';
import OlPoint from 'ol/geom/Point';

import type { default as OlGeometry } from 'ol/geom/Geometry';
import { createOverlayMarkerStyle } from '../../../overlay/shared/overlay-marker-style.utils';


export function zoneStyle(
  feature: olFeature<OlGeometry>,
  resolution: number
): olStyle.Style | olStyle.Style[] {
  if (feature.getGeometry() instanceof OlPoint && (feature.get('_buffer') === 0 || !(feature.get('_buffer')))) {
    return createOverlayMarkerStyle({markerColor: 'orange'});
  }

  return new olStyle.Style({
    image: new olStyle.Circle({
      radius: 10,
      fill: new olStyle.Fill({
        color: 'rgba(200, 200, 20, 0.2)'
      }),
      stroke: new olStyle.Stroke({
        width: 1,
        color: 'orange'
      })
    }),
    stroke: new olStyle.Stroke({
      width: 1,
      color: 'orange'
    }),
    fill: new olStyle.Fill({
      color: 'rgba(200, 200, 20, 0.2)'
    })
  });
}
