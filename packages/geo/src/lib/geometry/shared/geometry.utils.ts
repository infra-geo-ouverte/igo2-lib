import * as olstyle from 'ol/style';
import OlLineString from 'ol/geom/LineString';
import OlPolygon from 'ol/geom/Polygon';

/**
 * Create a default style for draw and modify interactions
 * @returns OL style
 */
export function createDrawInteractionStyle(): olstyle.Style {
  return new olstyle.Style({
    stroke: new olstyle.Stroke({
      color:  [0, 153, 255, 1],
      width: 2
    }),
    fill:  new olstyle.Fill({
      color:  [0, 153, 255, 0.2]
    }),
    image: new olstyle.Circle({
      radius: 5,
      stroke: new olstyle.Stroke({
        color: [0, 153, 255, 1],
      }),
      fill: new olstyle.Fill({
        color:  [0, 153, 255, 0.2]
      })
    })
  });
}

/**
 * Split geometry into two
 * @param olGeometry OL feature
 */
export function sliceOlGeometry(
  olGeometry: OlLineString | OlPolygon,
  olSlicer: OlLineString
): Array<OlLineString | OlPolygon> {
  if (olGeometry instanceof OlPolygon) {
    return sliceOlPolygon(olGeometry, olSlicer);
  } else if (olGeometry instanceof OlLineString) {
    return sliceOlLineString(olGeometry, olSlicer);
  }
  return [];
}

/**
 * Slice OL LineString into one or more polygons
 * @param olLineString OL polygon
 */
export function sliceOlLineString(olLineString: OlLineString, olSlicer: OlLineString): OlLineString[] {
  return [];
}

/**
 * Slice OL Polygon into one or more polygons
 * @param olPolygon OL polygon
 */
export function sliceOlPolygon(olPolygon: OlPolygon, olSlicer: OlLineString): OlPolygon[] {
  return [];
}
