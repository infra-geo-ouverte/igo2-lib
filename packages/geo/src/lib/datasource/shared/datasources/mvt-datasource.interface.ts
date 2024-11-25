import olSourceVectorTile from 'ol/source/VectorTile';

import { DataSourceOptions } from './datasource.interface';

export interface MVTDataSourceOptions extends DataSourceOptions {
  // type?: 'mvt';
  projection?: string;
  attributions?: string | string[];
  format?: any;
  ol?: olSourceVectorTile;
  url?: string;
  pathOffline?: string;
  excludeAttribute?: string[];
  excludeAttributeOffline?: string[];
  featureClass?: string;
}
