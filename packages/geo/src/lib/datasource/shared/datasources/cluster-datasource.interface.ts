import type { default as OlGeometry } from 'ol/geom/Geometry';
import olSourceVector from 'ol/source/Vector';

import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface ClusterDataSourceOptions extends FeatureDataSourceOptions {
  // type?: 'cluster';
  distance?: number;
  source?: olSourceVector<OlGeometry>;
  ol?: olSourceVector<OlGeometry>;
  pathOffline?: string;
  excludeAttribute?: Array<string>;
  excludeAttributeOffline?: Array<string>;
}
