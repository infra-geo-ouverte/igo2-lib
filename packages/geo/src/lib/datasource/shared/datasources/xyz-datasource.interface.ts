import { DataSourceOptions } from './datasource.interface';

export interface XYZDataSourceOptions extends DataSourceOptions {
  // type?: 'xyz';
  projection?: string;
  url?: string;
  urls?: string[];
  pathOffline?: string;
  excludeAttribute?: string[];
  excludeAttributeOffline?: string[];
}
