import { DataSourceOptions } from './datasource.interface';

export interface MVTDataSourceOptions extends DataSourceOptions {
  // type?: 'mvt';
  projection?: string;
  attributions?: string | string[];
  format?: any;
  url?: string;
  pathOffline?: string;
  excludeAttribute?: string[];
  excludeAttributeOffline?: string[];
  featureClass?: string;
}
