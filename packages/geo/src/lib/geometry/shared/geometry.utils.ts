import OlCircle from 'ol/geom/Circle';
import OlPoint from 'ol/geom/Point';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as olstyle from 'ol/style';
import OlLineString from 'ol/geom/LineString';
import OlLinearRing from 'ol/geom/LinearRing';
import OlPolygon from 'ol/geom/Polygon';
import BasicEvent from 'ol/events/Event';
import OlGeoJSON from 'ol/format/GeoJSON';
import lineIntersect from '@turf/line-intersect';
import { lineString } from '@turf/helpers';

import {
  GeometrySliceMultiPolygonError,
  GeometrySliceLineStringError,
  GeometrySliceTooManyIntersectionError
} from './geometry.errors';

/**
 * Create a default style for draw and modify interactions
 * @param color Style color (R, G, B)
 * @returns OL style
 */
export function createDrawInteractionStyle(
  color?: [number, number, number]
): olstyle.Circle {
  color = color || [0, 153, 255];
  return new olstyle.Circle({
    stroke: new olstyle.Stroke({
      color: color.concat([1]),
      width: 2
    }),
    fill: new olstyle.Fill({
      color: color.concat([0.2])
    }),
    radius: 8
  });
}

/**
 * Create a default style for drawing a hole
 * @returns OL style
 */
export function createDrawHoleInteractionStyle(): olstyle.Style {
  return new olstyle.Style({
    stroke: new olstyle.Stroke({
      color: [0, 153, 255, 1],
      width: 2
    })
  });
}

/**
 * Slice geometry into two parts
 * @param olGeometry OL geometry
 * @param olSlicer Slicing line
 * @returns New OL geometries
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
 * Slice OL LineString into one or more lines
 * @param olLineString OL line string
 * @param olSlicer Slicing line
 * @returns New OL line strings
 */
export function sliceOlLineString(
  olLineString: OlLineString,
  olSlicer: OlLineString
): OlLineString[] {
  return [];
}

/**
 * Slice OL Polygon into one or more polygons
 * @param olPolygon OL polygon
 * @param olSlicer Slicing line
 * @returns New OL polygons
 */
export function sliceOlPolygon(
  olPolygon: OlPolygon,
  olSlicer: OlLineString
): OlPolygon[] {
  if (olPolygon.getLinearRingCount() > 1) {
    throw new GeometrySliceMultiPolygonError();
  }

  if (olSlicer.getCoordinates().length > 2) {
    throw new GeometrySliceLineStringError();
  }

  const olGeoJSON = new OlGeoJSON();
  const slicer = olGeoJSON.writeGeometryObject(olSlicer) as any;
  const outerCoordinates = olPolygon.getLinearRing(0).getCoordinates();

  const parts = [[], []];
  let totalIntersectionCount = 0;
  for (let i = 0, ii = outerCoordinates.length - 1; i < ii; i++) {
    const segmentCoordinates = [outerCoordinates[i], outerCoordinates[i + 1]];
    const segment = lineString(segmentCoordinates);
    const intersections = lineIntersect(segment, slicer).features;

    const intersectionCount = intersections.length;
    totalIntersectionCount += intersectionCount;
    if (intersectionCount > 1 || totalIntersectionCount > 2) {
      throw new GeometrySliceTooManyIntersectionError();
    }

    parts[0].push(segmentCoordinates[0]);
    if (intersectionCount === 1) {
      const intersection = intersections[0].geometry.coordinates;
      parts[0].push(intersection);
      parts[1].push(intersection);
      parts.reverse();
    }
  }

  if (totalIntersectionCount <= 1) {
    return [];
  }

  parts[0].push(parts[0][0]);
  parts[1].push(parts[1][0]);

  return [new OlPolygon([parts[0]]), new OlPolygon([parts[1]])];
}

/**
 * Splice geometry into two parts
 * @param olGeometry OL geometry
 * @param olSlicer Slicing line
 * @returns New OL geometries
 */
export function addLinearRingToOlPolygon(
  olPolygon: OlPolygon,
  olLinearRing: OlLinearRing
) {
  // TODO: make some validation and support updating an existing linear ring
  olPolygon.appendLinearRing(olLinearRing);
}

export function getMousePositionFromOlGeometryEvent(olEvent: BasicEvent) {
  const olGeometry = olEvent.target as OlGeometry;
  if (olGeometry instanceof OlPolygon) {
    return olGeometry.getFlatCoordinates().slice(-4, -2) as [number, number];
  }
  const olGeometryCast = olGeometry as OlPoint | OlLineString | OlCircle;
  return olGeometryCast.getFlatCoordinates().slice(-2) as [number, number];
}
