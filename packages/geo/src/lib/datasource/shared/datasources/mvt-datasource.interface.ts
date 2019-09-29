import olSourceVectorTile from 'ol/source/VectorTile';
import olAttribution from 'ol/control/Attribution';

import { DataSourceOptions } from './datasource.interface';

export interface MVTDataSourceOptions extends DataSourceOptions {
  // type?: 'mvt';
  projection?: string;
  attributions?: olAttribution;
  format?: any;
  ol?: olSourceVectorTile;
  url?: string;
  pathOffline?: string;
  excludeAttribute?: Array<string>;
  excludeAttributeOffline?: Array<string>;
}
