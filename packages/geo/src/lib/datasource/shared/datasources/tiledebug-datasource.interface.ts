import TileDebug from 'ol/source/TileDebug';

import { DataSourceOptions, TileGridOptions } from './datasource.interface';

export interface TileDebugDataSourceOptions extends DataSourceOptions {
  projection?: string;
  wrapX?: boolean;
  ol?: TileDebug;
  zDirection?: number;
  tileGrid?: TileGridOptions;
}
