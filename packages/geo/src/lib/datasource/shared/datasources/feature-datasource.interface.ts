import olSourceVector from 'ol/source/Vector';
import olFeature from 'ol/Feature';
import olFormatFeature from 'ol/format/Feature';
import olSource from 'ol/source/Source';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { DataSourceOptions } from './datasource.interface';

export interface FeatureDataSourceOptions extends DataSourceOptions {
  // type?: 'vector' | 'wfs';
  formatType?: string;
  formatOptions?: any;

  params?: any;
  features?: olFeature<OlGeometry>[];
  format?: olFormatFeature;
  url?: string;
  pathOffline?: string;
  preload?: PreloadOptions;
  excludeAttribute?: Array<string>;
  excludeAttributeOffline?: Array<string>;

  ol?: olSourceVector<OlGeometry> | olSource;
}

export interface PreloadOptions {
  bypassVisible?: boolean;
  bypassResolution?: boolean;
}
