import olSourceCarto from 'ol/source/CartoDB';

import { DataSourceOptions } from './datasource.interface';

export interface CartoDataSourceOptions extends DataSourceOptions {
  // type?: 'carto';
  params?: any;
  queryPrecision?: string;

  crossOrigin?: string;
  projection?: string;
  config?: any;
  map?: string;
  account?: string;

  ol?: olSourceCarto;
}
