import olSourceWMTS from 'ol/source/WMTS';

import { DataSourceOptions } from './datasource.interface';

export interface WMTSDataSourceOptions extends DataSourceOptions {
  // type?: 'wmts';
  projection?: string;
  layer: string;
  style?: string;
  version?: string;
  format?: string;
  matrixSet?: string;
  url?: string;
  urls?: string[];
  ol?: olSourceWMTS;
}
