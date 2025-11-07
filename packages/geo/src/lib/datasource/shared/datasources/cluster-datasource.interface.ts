import olSourceVector from 'ol/source/Vector';

import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface ClusterDataSourceOptions extends FeatureDataSourceOptions {
  distance?: number;
  source?: olSourceVector;
  pathOffline?: string;
  excludeAttribute?: string[];
  excludeAttributeOffline?: string[];
}
