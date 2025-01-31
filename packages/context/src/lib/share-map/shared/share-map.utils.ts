import {
  AnyDataSourceOptions,
  ArcGISRestDataSourceOptions,
  ArcGISRestImageDataSourceOptions,
  LayerOptions,
  QueryFormat,
  QueryableDataSourceOptions,
  TileArcGISRestDataSourceOptions,
  WMSDataSourceOptions,
  WMTSDataSourceOptions
} from '@igo2/geo';

import { ServiceType } from './share-map.interface';

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
    version: type === 'wmts' ? '1.0.0' : undefined,
    optionsFromCapabilities: true,
    optionsFromApi: true,
    crossOrigin: 'anonymous'
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

export function getLayerParam(layerOptions: LayerOptions): string | undefined {
  const { sourceOptions } = layerOptions;
  const { type } = sourceOptions;

  switch (type) {
    case 'wms':
      return (sourceOptions as WMSDataSourceOptions).params.LAYERS;

    case 'wmts':
    case 'arcgisrest':
      return (
        sourceOptions as WMTSDataSourceOptions | ArcGISRestDataSourceOptions
      ).layer;

    case 'imagearcgisrest':
    case 'tilearcgisrest': {
      const { layer, params } = sourceOptions as
        | ArcGISRestImageDataSourceOptions
        | TileArcGISRestDataSourceOptions;
      return layer ?? params?.layer;
    }

    default:
      return undefined;
  }
}
