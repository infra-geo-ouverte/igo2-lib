import * as olproj from 'ol/proj';

import { MapViewState } from './map.interface';

/**
 * This method extracts a [lon, lat] tuple from a string.
 * @param str Any string
 * @returns A [lon, lat] tuple if one is found in the string
 * @todo Reproject coordinates
 */
export function stringToLonLat(str: string): [number, number] | undefined {
  const coordPattern =  '[-+]?[\\d]{1,8}(\\.)?(\\d+)?';
  const projectionPattern = '(;[\\d]{4,5})';
  const lonLatPattern = `^${coordPattern},(\\s)*${coordPattern}${projectionPattern}?`;
  const lonLatRegex = new RegExp(lonLatPattern, 'g');

  if (!lonLatRegex.test(str)) {
    return undefined;
  }

  let lonLatStr = str;
  let projectionStr;

  const projectionRegex = new RegExp(projectionPattern, 'g');
  if (projectionRegex.test(str)) {
    [lonLatStr, projectionStr] = str.split(';');
  }

  const [lonStr, latStr] = lonLatStr.split(',');
  const lonLat = [parseFloat(lonStr), parseFloat(latStr)] as [number, number];

  if (projectionStr !== undefined) {
    // TODO Reproject coordinates
  }

  return lonLat;
}

/**
 * Return true of two view states are equal.
 * @param state1 View state
 * @param state2 View state
 * @returns True if the view states are equal
 */
export function viewStatesAreEqual(state1: MapViewState, state2: MapViewState): boolean {
  if (state1 === undefined || state2 === undefined) {
    return false;
  }

  const tolerance = 1 / 10000;
  return state1.zoom === state2.zoom &&
    Math.trunc(state1.center[0] / tolerance) === Math.trunc(state2.center[0] / tolerance) &&
    Math.trunc(state1.center[1] / tolerance) === Math.trunc(state2.center[1] / tolerance);
}

/**
 * Format the scale to a human readable text
 * @param Scale of the map
 * @returns Human readable scale text
 */
export function formatScale(scale) {
  scale = Math.round(scale);
  if (scale < 10000) { return scale + ''; }

  scale = Math.round(scale / 1000);
  if (scale < 1000) { return scale + 'K'; }

  scale = Math.round(scale / 1000);
  return scale + 'M';
}

/**
 * Return the resolution from a scale denom
 * @param Scale denom
 * @returns Resolution
 */
export function getResolutionFromScale(scale: number, dpi: number = 72): number {
  return scale / (39.37 * dpi);
}

/**
 * Return the resolution from a scale denom
 * @param Scale denom
 * @returns Resolution
 */
export function getScaleFromResolution(resolution: number, unit: string = 'm', dpi: number = 72): number {
  return resolution * olproj.METERS_PER_UNIT[unit] * 39.37 * dpi;
}
