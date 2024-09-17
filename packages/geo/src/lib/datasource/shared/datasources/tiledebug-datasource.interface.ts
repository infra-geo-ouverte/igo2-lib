import { DataSourceOptions, TileGridOptions } from './datasource.interface';

export interface TileDebugDataSourceOptions extends DataSourceOptions {
  projection?: string;
  wrapX?: boolean;
  zDirection?: number;
  tileGrid?: TileGridOptions;
}
