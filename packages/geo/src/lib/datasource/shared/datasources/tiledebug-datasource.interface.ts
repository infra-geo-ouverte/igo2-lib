import { DataSourceOptions, TileGridOptions } from './datasource.interface';
import {TileDebug} from 'ol/source';

export interface TileDebugDataSourceOptions extends DataSourceOptions {
  projection?: string;
  wrapX?: boolean;
  ol?: TileDebug;
  zDirection?: number;
  tileGrid?: TileGridOptions;
}
