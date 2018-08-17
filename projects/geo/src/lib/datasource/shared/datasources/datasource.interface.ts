import olSource from 'ol/source/Source';

import { DataSource } from './datasource';

export interface DataSourceOptions {
  type?: 
    | 'wms'
    | 'wfs'
    | 'vector'
    | 'wmts'
    | 'xyz'
    | 'osm'
    | 'carto'
    | 'arcgisrest'
    | 'tilearcgisrest';
  legend?: DataSourceLegendOptions;
  // title: string;
  // alias?: string;

  // view?: ol.olx.layer.ImageOptions;
  // displayField?: string;
  ol?: olSource;
}

export interface DataSourceLegendOptions {
  collapsed?: boolean;
  display?: boolean;
  url?: string;
  html?: string;
  style?: { [key: string]: string | number };
  title?: string;
}
