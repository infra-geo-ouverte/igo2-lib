import { Params } from '@angular/router';

import { RouteServiceOptions } from '@igo2/core/route';
import {
  AnyDataSourceOptions,
  AnyLayerOptions,
  QueryFormat,
  QueryableDataSourceOptions,
  isLayerGroupOptions
} from '@igo2/geo';

import { ServiceType, ShareMapKeysDefinitions } from './share-map.interface';

export function buildDataSourceOptions(
  type: ServiceType,
  url: string,
  layers: string[],
  version: string
): AnyDataSourceOptions {
  const isLayerType = [
    'wmts',
    'arcgisrest',
    'imagearcgisrest',
    'tilearcgisrest'
  ].includes(type);
  const arcgisClause =
    type === 'arcgisrest' ||
    type === 'imagearcgisrest' ||
    type === 'tilearcgisrest';
  const params =
    type === 'wms' ? { LAYERS: layers.join(','), VERSION: version } : undefined;

  const layer = isLayerType ? layers.join(',') : undefined;
  const baseParams = {
    type: type,
    url,
    params,
    layer,
    version: type === 'wmts' ? '1.0.0' : undefined
  };

  if (arcgisClause) {
    return {
      ...baseParams,
      queryable: true,
      queryFormat: QueryFormat.ESRIJSON
    } as QueryableDataSourceOptions;
  }

  return baseParams;
}

export function getFlattenOptions(
  options: AnyLayerOptions[]
): AnyLayerOptions[] {
  return options.reduce((accumulator, option) => {
    if (isLayerGroupOptions(option)) {
      const children = option.children
        ? getFlattenOptions(option.children)
        : [];
      accumulator.push(option, ...children);
    } else {
      accumulator.push(option);
    }
    return accumulator;
  }, []);
}

/**
 * Checks if the provided query parameters contain legacy parameter pairs
 * (e.g., layers and URLs) that indicate older configuration formats.
 */
export function hasLegacyParams(
  params: Params,
  optionsLegacy: RouteServiceOptions
): boolean {
  const {
    layersKey,
    wmsUrlKey,
    wmsLayersKey,
    wmtsUrlKey,
    wmtsLayersKey,
    arcgisUrlKey,
    arcgisLayersKey,
    iarcgisUrlKey,
    iarcgisLayersKey,
    tarcgisUrlKey,
    tarcgisLayersKey
  } = optionsLegacy;

  // Define valid legacy parameter pairs
  const legacyPairs: [string | undefined, string | undefined][] = [
    [layersKey, wmsUrlKey],
    [wmsLayersKey, wmsUrlKey],
    [wmtsLayersKey, wmtsUrlKey],
    [arcgisLayersKey, arcgisUrlKey],
    [iarcgisLayersKey, iarcgisUrlKey],
    [tarcgisLayersKey, tarcgisUrlKey]
  ].filter(([layer, url]) => layer && url) as [string, string][];

  // Check if any legacy pair exists in the query parameters
  return legacyPairs.some(
    ([layer, url]) => getParamValue(params, layer) && getParamValue(params, url)
  );
}

export function hasModernShareParams(
  params: Params,
  keysDefinitions: ShareMapKeysDefinitions
): boolean {
  const { layers, groups } = keysDefinitions;
  const hasGroups = !!getParamValue(params, groups.key);
  const hasLayers = !!getParamValue(params, layers.key);

  return hasLayers || hasGroups;
}

export function getParamValue(params: Params, key: string): string | undefined {
  const value = params[key];
  return value !== '' ? value : undefined;
}
