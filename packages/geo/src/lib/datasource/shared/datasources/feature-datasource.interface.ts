import olSourceVector from 'ol/source/Vector';
import olFeature from 'ol/Feature';
import olFormatFeature from 'ol/format/Feature';

import { DataSourceOptions } from './datasource.interface';

export interface FeatureDataSourceOptions extends DataSourceOptions {
  // type?: 'vector' | 'wfs';
  formatType?: string;
  formatOptions?: any;

  features?: olFeature[];
  format?: olFormatFeature;
  url?: string;
  pathOffline?: string;
  excludeAttribute?: Array<string>;
  excludeAttributeOffline?: Array<string>;

  ol?: olSourceVector;
}
