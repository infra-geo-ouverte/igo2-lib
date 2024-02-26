import olSourceVector from 'ol/source/Vector';

import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface ClusterDataSourceOptions extends FeatureDataSourceOptions {
  // type?: 'cluster';
  distance?: number;
  source?: olSourceVector;
  ol?: olSourceVector;
  pathOffline?: string;
  excludeAttribute?: Array<string>;
  excludeAttributeOffline?: Array<string>;
}
