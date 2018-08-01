import VectorSource from 'ol/source/Vector';
import FeatureOL from 'ol/Feature';
import FeatureFormat from 'ol/format/Feature';

import { DataSourceOptions } from './datasource.interface';

export interface FeatureDataSourceOptions extends DataSourceOptions {
  formatType?: string;
  formatOptions?: any;

  features?: FeatureOL[];
  format?: FeatureFormat;
  url?: string;

  ol?: VectorSource;
}
