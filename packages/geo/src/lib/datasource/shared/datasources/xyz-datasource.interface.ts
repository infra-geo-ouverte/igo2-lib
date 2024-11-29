import olSourceXYZ from 'ol/source/XYZ';

import { DataSourceOptions } from './datasource.interface';

export interface XYZDataSourceOptions extends DataSourceOptions {
  // type?: 'xyz';
  projection?: string;
  ol?: olSourceXYZ;
  url?: string;
  urls?: string[];
  pathOffline?: string;
  excludeAttribute?: string[];
  excludeAttributeOffline?: string[];
}
