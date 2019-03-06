import { Md5 } from 'ts-md5';

import { uuid } from '@igo2/utils';

import {
  DataSourceOptions,
  WMSDataSourceOptions,
  WMTSDataSourceOptions
} from '../../datasource';

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
 * Generate a layer id from it's datasource options.
 * @param options Data source options
 * @returns A layer id
 */
export function generateLayerIdFromSourceOptions(options: DataSourceOptions): string {
  let id;
  if (options.type === 'wms') {
    id = generateWMSLayerIdFromSourceOptions(options as WMSDataSourceOptions);
  } else if (options.type === 'wmts') {
    id = generateWMTSLayerIdFromSourceOptions(options as WMTSDataSourceOptions);
  } else {
    id = uuid();
  }

  return id;
}

/**
 * Generate a layer id from WMS data source options
 * @param options WMS data source options
 * @returns A md5 hash of the the url and layers
 */
export function generateWMSLayerIdFromSourceOptions(options: WMSDataSourceOptions) {
  const layers = options.params.layers;
  const chain = 'wms' + options.url + layers;
  return Md5.hashStr(chain) as string;
}

/**
 * Generate a layer id from WMTS data source options
 * @param options WMTS data source options
 * @returns A md5 hash of the the url and layer
 */
export function generateWMTSLayerIdFromSourceOptions(options: WMTSDataSourceOptions) {
  const layer = options.layer;
  const chain = 'wmts' + options.url + layer;
  return Md5.hashStr(chain) as string;
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
