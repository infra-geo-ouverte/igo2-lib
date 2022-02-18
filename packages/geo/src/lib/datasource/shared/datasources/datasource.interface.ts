import olSource from 'ol/source/Source';
import { DownloadOptions } from '../../../download/shared/download.interface';
import { OgcFilterOperatorType } from '../../../filter/shared/ogc-filter.enum';
import type { default as OlGeometryType } from 'ol/geom/GeometryType';

export interface DataSourceOptions {
  type?:
    | 'wms'
    | 'wfs'
    | 'vector'
    | 'wmts'
    | 'xyz'
    | 'osm'
    | 'tiledebug'
    | 'carto'
    | 'arcgisrest'
    | 'imagearcgisrest'
    | 'tilearcgisrest'
    | 'websocket'
    | 'mvt'
    | 'cluster';
  optionsFromCapabilities?: boolean;
  optionsFromApi?: boolean;
  _layerOptionsFromSource?: { [key: string]: string };
  id?: string;
  ol?: olSource;
  minZoom?: number;
  maxZoom?: number;
  minDate?: string;
  maxDate?: string;
  stepDate?: string;
  // TODO: Should those options really belong here?
  sourceFields?: SourceFieldsOptionsParams[];
  download?: DownloadOptions;
  edition?: EditionOptions;
  relations?: RelationOptions[];
}

export interface SourceFieldsOptionsParams {
  step: number;
  relation: RelationOptions;
  name: any;
  alias?: any;
  values?: any;
  excludeFromOgcFilters?: boolean;
  allowedOperatorsType?: OgcFilterOperatorType;
  type?: number | number[] | string | string[] | boolean | Date;
  primary?: boolean;
  visible?: boolean;
  validation?: SourceFieldsValidationParams;
  multiple?: boolean;
}

export interface EditionOptions {
  enabled: boolean;
  baseUrl: string;
  addUrl: string;
  deleteUrl: string;
  modifyUrl: string;
  geomType: typeof OlGeometryType;
  hasGeometry: boolean;
  addWithDraw?: boolean;
  messages?: any[];
  addHeaders?: { [key: string]: any };
  modifyHeaders?: { [key: string]: any };
  modifyProtocol?: string;
}

export interface RelationOptions {
  title?: string;
  name?: string;
  alias?: string;
  icon?: string;
  table: string;
  parent?: string;
}

export interface SourceFieldsValidationParams {
  mandatory?: boolean;
  maxLength?: number;
  minLength?: number;
  readonly: boolean;
}

export interface Legend {
  collapsed?: boolean;
  display?: boolean;
  url?: string;
  html?: string;
  style?: { [key: string]: string | number };
  title?: string;
  currentStyle?: string;
  imgGraphValue?: string;
}

// refer to https://openlayers.org/en/latest/apidoc/module-ol_tilegrid_TileGrid-TileGrid.html
export interface TileGridOptions {
  extent: [number, number, number, number];
  minZoom?: number;
  origin?: [number, number];
  origins?: [number, number][];
  resolutions: number[];
  sizes?: [number, number][];
  tileSize?: [number, number];
  tileSizes?: [number, number][];
}
