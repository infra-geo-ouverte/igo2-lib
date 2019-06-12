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
    | 'tilearcgisrest'
    | 'websocket';
  optionsFromCapabilities?: boolean;
  legendOptions?: LegendOptions;
  // title: string;
  // alias?: string;

  // view?: ol.olx.layer.ImageOptions;
  ol?: olSource;
  // TODO: Should those options really belong here?
  sourceFields?: SourceFieldsOptionsParams[];
  download?: DownloadOptions;
}

export interface SourceFieldsOptionsParams {
  name: any;
  alias?: any;
  values?: any;
}

export interface ItemStyleOptions {
  name: string;
  title?: string;
  }

export interface LegendOptions {
  collapsed?: boolean;
  display?: boolean;
  url?: string;
  stylesAvailable?: ItemStyleOptions[];
}

export interface Legend {
  collapsed?: boolean;
  display?: boolean;
  url?: string;
  html?: string;
  style?: { [key: string]: string | number };
  title?: string;
  currentStyle?: string;
}
