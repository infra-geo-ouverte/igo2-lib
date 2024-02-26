import olFeature from 'ol/Feature';
import olFormatFeature from 'ol/format/Feature';
import olSource from 'ol/source/Source';
import olSourceVector from 'ol/source/Vector';

import { DataSourceOptions } from './datasource.interface';

export interface FeatureDataSourceOptions extends DataSourceOptions {
  // type?: 'vector' | 'wfs';
  formatType?: string;
  formatOptions?: any;

  params?: any;
  features?: olFeature[];
  format?: olFormatFeature;
  url?: string;
  pathOffline?: string;
  preload?: PreloadOptions;
  excludeAttribute?: Array<string>;
  excludeAttributeOffline?: Array<string>;

  ol?: olSourceVector | olSource;
}

export interface PreloadOptions {
  bypassVisible?: boolean;
  bypassResolution?: boolean;
}
