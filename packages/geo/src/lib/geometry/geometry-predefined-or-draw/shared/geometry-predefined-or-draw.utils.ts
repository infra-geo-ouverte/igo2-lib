
import olFeature from 'ol/Feature';
import * as olStyle from 'ol/style';
import OlPoint from 'ol/geom/Point';

import type { default as OlGeometry } from 'ol/geom/Geometry';


export function zoneStyle(
  feature: olFeature<OlGeometry>,
  resolution: number
): olStyle.Style | olStyle.Style[] {
  //const coordinatesk = (feature[0] as any).coordinates;
  let radius;
  if (feature.getGeometry() instanceof OlPoint) {
    const coordinates = (feature.getGeometry() as OlPoint).getCoordinates();
    const buffer = feature.get('_buffer');

    radius = coordinates && buffer !== 0 ? buffer / Math.cos((Math.PI / 180) * coordinates[1]) / resolution : 10;
  }

  return new olStyle.Style({
    image: new olStyle.Circle({
      radius,
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
