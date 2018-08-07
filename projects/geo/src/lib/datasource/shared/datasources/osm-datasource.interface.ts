import olSourceOSM from 'ol/source/OSM';

import { DataSourceOptions } from './datasource.interface';

export interface OSMDataSourceOptions extends DataSourceOptions {
  // type?: 'osm';
  maxZoom?: number;
  url?: string;
  ol?: olSourceOSM;
}
