import olSource from 'ol/source/Source';

import { DataSource } from './datasource';
import { DownloadOptions } from '../../../download/shared/download.interface';

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
  optionsFromCapabilities?: boolean;
  // title: string;
  // alias?: string;

  // view?: ol.olx.layer.ImageOptions;
  ol?: olSource;
  sourceFields?: SourceFieldsOptionsParams[];
  download?: DownloadOptions;
}

export interface DataSourceLegendOptions {
  collapsed?: boolean;
  display?: boolean;
  url?: string;
  html?: string;
  style?: { [key: string]: string | number };
  title?: string;
}

export interface SourceFieldsOptionsParams {
  name: any;
  alias?: any;
  values?: any;
}
