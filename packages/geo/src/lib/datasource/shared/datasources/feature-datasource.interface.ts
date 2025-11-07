import olFeature from 'ol/Feature';
import olFormatFeature from 'ol/format/Feature';

import { DataSourceOptions } from './datasource.interface';

export interface FeatureDataSourceOptions extends DataSourceOptions {
  formatType?: string;
  formatOptions?: any;

  params?: any;
  features?: olFeature[];
  format?: olFormatFeature;
  url?: string;
  pathOffline?: string;
  preload?: PreloadOptions;
  excludeAttribute?: string[];
  excludeAttributeOffline?: string[];
}

export interface PreloadOptions {
  bypassVisible?: boolean;
  bypassResolution?: boolean;
}
