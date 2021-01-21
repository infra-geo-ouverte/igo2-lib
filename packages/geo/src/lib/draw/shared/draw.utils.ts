import * as olstyle from 'ol/style';
import OlPoint from 'ol/geom/Point';
import OlLineString from 'ol/geom/LineString';
import OlPolygon from 'ol/geom/Polygon';
import OlCircle from 'ol/geom/Circle';
import OlOverlay from 'ol/Overlay';
import {
  updateOlGeometryMidpoints,
  updateOlGeometryCenter
} from '../../measure/shared/measure.utils';


/**
 * Create a default style for a drawO interaction
 * @returns OL style
 */
export function createDrawingInteractionStyle(fill?: string, stroke?: string, text?: string): olstyle.Style {
    return new olstyle.Style({
      stroke: new olstyle.Stroke({
        color: stroke ? stroke : '#3399CC',
        width: 2
      }),
      fill: new olstyle.Fill({
        color: fill ? fill : 'rgba(255,255,255,0.4)'
      }),
      text: new olstyle.Text({
        text: text ? text : ''
      }),
      image: new olstyle.Circle({
        radius: 5,
        stroke: new olstyle.Stroke({
          color: stroke ? stroke : '#3399CC',
        }),
        fill: new olstyle.Fill({
          color: fill ? fill : 'rgba(255,255,255,0.4)'
        })
      })
    });
}

/**
 * Add an OL overlay at each midpoint and return an array of those overlays
 * @param olGeometry OL Geometry
 * @returns OL overlays
 */
export function updateOlTooltipsDrawAtMidpoints(olGeometry: OlPoint | OlLineString | OlPolygon | OlCircle): OlOverlay[] {
  let olMidpoints;
  if (olGeometry instanceof OlPoint) {
    const olMidpointPoint = new OlPoint(olGeometry.flatCoordinates);
    olMidpoints = new Array(1);
    olMidpoints[0] = olMidpointPoint;
    olGeometry.setProperties({_midpoints: olMidpoints}, true);
  } else if (olGeometry instanceof OlCircle) {
    const olMidpointPoint = new OlPoint(olGeometry.getCenter());
    olMidpoints = new Array(1);
    olMidpoints[0] = olMidpointPoint;
    olGeometry.setProperties({_midpoints: olMidpoints}, true);
  } else  {
    olMidpoints = updateOlGeometryMidpoints(olGeometry);
  }
  const olTooltips = olMidpoints.map((olMidpoint: OlPoint) => {
    let olTooltip = olMidpoint.get('_tooltip');
    if (olTooltip === undefined) {
      olTooltip = createOlTooltipDrawAtPoint(olMidpoint);
    } else {
      olTooltip.setPosition(olMidpoint.flatCoordinates);
    }
    return olTooltip;
  });
  return olTooltips;
}

/**
 * Add an OL overlay at the center of a geometry and return that overlay
 * @param olGeometry OL Geometry
 * @returns OL overlay
 */
export function updateOlTooltipDrawAtCenter(olGeometry: OlLineString | OlPolygon): OlOverlay {
  const olCenter = updateOlGeometryCenter(olGeometry);
  let olTooltip = olCenter.get('_tooltip');
  if (olTooltip === undefined) {
    olTooltip = createOlTooltipDrawAtPoint(olCenter);
  } else {
    olTooltip.setPosition(olCenter.flatCoordinates);
  }
  return olTooltip;
}

/**
 * Create an OL overlay at a point and bind the overlay to the point
 * @param olPoint OL Point
 * @returns OL overlay
 */
export function createOlTooltipDrawAtPoint(olPoint: OlPoint): OlOverlay {
  const olTooltip = new OlOverlay({
    element: document.createElement('div'),
    offset: [-30, -10],
    className: [
      'igo-map-tooltip',
      'igo-map-tooltip-draw'
    ].join(' '),
    stopEvent: false
  });
  olTooltip.setPosition(olPoint.flatCoordinates);
  olPoint.set('_tooltip', olTooltip);

  return olTooltip;
}
