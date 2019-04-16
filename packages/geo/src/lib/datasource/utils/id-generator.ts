import { Md5 } from 'ts-md5';

import { uuid } from '@igo2/utils';

import { AnyDataSourceOptions } from '../shared/datasources/any-datasource.interface';
import { DataSourceOptions } from '../shared/datasources/datasource.interface';
import { WMSDataSourceOptions } from '../shared/datasources/wms-datasource.interface';
import { WMTSDataSourceOptions } from '../shared/datasources/wmts-datasource.interface';

/**
 * Generate a id from it's datasource options.
 * @param options Data source options
 * @returns A id
 */
export function generateIdFromSourceOptions(options: DataSourceOptions): string {
  const generators = {
    wms: generateWMSIdFromSourceOptions,
    wmts: generateWMTSIdFromSourceOptions,
    xyz: generateXYZIdFromSourceOptions,
    feature: generateFeatureIdFromSourceOptions,
    osm: (_options: AnyDataSourceOptions) => 'OSM'
  };
  const generator = generators[options.type] || generateId;
  return generator(options);
}

/**
 * Generate a id from WMS data source options
 * @param options WMS data source options
 * @returns A md5 hash of the the url and layers
 */
export function generateWMSIdFromSourceOptions(options: WMSDataSourceOptions) {
  const layers = options.params.layers;
  const chain = 'wms' + options.url + layers;
  return Md5.hashStr(chain) as string;
}

/**
 * Generate a id from WMTS data source options
 * @param options WMTS data source options
 * @returns A md5 hash of the the url and layer
 */
export function generateWMTSIdFromSourceOptions(options: WMTSDataSourceOptions) {
  const layer = options.layer;
  const chain = 'wmts' + options.url + layer;
  return Md5.hashStr(chain) as string;
}

/**
 * Generate a id from XYZ data source options
 * @param options XYZ data source options
 * @returns A md5 hash of the the url and layer
 */
export function generateXYZIdFromSourceOptions(options: WMTSDataSourceOptions) {
  const chain = 'xyz' + options.url;
  return Md5.hashStr(chain) as string;
}

/**
 * Generate a id from feature data source options
 * @param options XYZ data source options
 * @returns A md5 hash of the the url and layer
 */
export function generateFeatureIdFromSourceOptions(options: WMTSDataSourceOptions) {
  if (! options.url) { return generateId(options); }
  const chain = 'feature' + options.url;
  return Md5.hashStr(chain) as string;
}

/**
 * Generate a unique id
 * @returns A uuid
 */
export function generateId(options: AnyDataSourceOptions) {
  return uuid();
}
