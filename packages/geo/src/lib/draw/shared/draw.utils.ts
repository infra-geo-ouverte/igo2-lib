import * as Olstyle from 'ol/style';
import OlPoint from 'ol/geom/Point';
import OlLineString from 'ol/geom/LineString';
import OlPolygon from 'ol/geom/Polygon';
import OlCircle from 'ol/geom/Circle';
import OlOverlay from 'ol/Overlay';
import {
  updateOlGeometryMidpoints,
  updateOlGeometryCenter
} from '../../measure/shared/measure.utils';
import { CoordinatesUnit } from './draw.enum';
import { convertDDToDMS, roundCoordToString } from '../../map/shared/map.utils';


/**
 * Create a default style
 * @param fillColor the fill color
 * @param strokeColor the stroke color
 * @param strokeWidth the stroke width
 * @param label a label
 * @returns OL style
 */
export function createInteractionStyle(fillColor?: string, strokeColor?: string, strokeWidth?: number, label?: string): Olstyle.Style {
  return new Olstyle.Style({
    stroke: new Olstyle.Stroke({
      color: strokeColor ? strokeColor : 'rgba(143,7,7,1)',
      width: strokeWidth ? strokeWidth : 1
    }),
    fill: new Olstyle.Fill({
      color: fillColor ? fillColor : 'rgba(255,255,255,0.4)'
    }),
    image: new Olstyle.Circle({
      radius: 5,
      stroke: new Olstyle.Stroke({
        color: strokeColor ? strokeColor : 'rgba(143,7,7,1)',
        width: strokeWidth ? strokeWidth : 1
      }),
      fill: new Olstyle.Fill({
        color: fillColor ? fillColor : 'rgba(255,255,255,0.4)'
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
    const olMidpointPoint = new OlPoint(olGeometry.getFlatCoordinates());
    olMidpoints = new Array(1);
    olMidpoints[0] = olMidpointPoint;
    olGeometry.setProperties({_midpoints: olMidpoints}, true);
  } else if (olGeometry instanceof OlCircle) {
    const olMidpointPoint = new OlPoint(olGeometry.getCenter());
    olMidpoints = new Array(1);
    olMidpoints[0] = olMidpointPoint;
    olGeometry.setProperties({_midpoints: olMidpoints}, true);
  } else {
    olMidpoints = updateOlGeometryMidpoints(olGeometry);
  }
  const olTooltips = olMidpoints.map((olMidpoint: OlPoint) => {
    let olTooltip = olMidpoint.get('_tooltip');
    if (olTooltip === undefined) {
      olTooltip = createOlTooltipDrawAtPoint(olMidpoint);
    } else {
      olTooltip.setPosition(olMidpoint.getFlatCoordinates());
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
    olTooltip.setPosition(olCenter.getFlatCoordinates());
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
  olTooltip.setPosition(olPoint.getFlatCoordinates());
  olPoint.set('_tooltip', olTooltip);

  return olTooltip;
}


export function DDtoDMS(value: [number, number], unit: CoordinatesUnit): string[] | undefined {
  const conversionMapper = new Map([
    [CoordinatesUnit.DecimalDegree, (val: [number, number]) => {
      if (typeof val[0] === 'number') {
        return roundCoordToString(val, 5) as string[];
      } else {
        const numVal: [number, number] = [Number(val[0]), Number(val[1])];
        return roundCoordToString(numVal, 5) as string[];
      }
    }],
    [CoordinatesUnit.DegreesMinutesSeconds, (val: [number, number]) => convertDDToDMS(val, 2)]
  ]);
  let conversion = conversionMapper.get(unit);

  return conversion ? conversion(value) : undefined;
}


