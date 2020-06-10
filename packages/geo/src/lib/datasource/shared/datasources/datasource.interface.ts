import olSource from 'ol/source/Source';
import { DownloadOptions } from '../../../download/shared/download.interface';
import { OgcFilterOperatorType } from '../../../filter/shared/ogc-filter.enum';

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
}

export interface SourceFieldsOptionsParams {
  name: any;
  alias?: any;
  values?: any;
  excludeFromOgcFilters?: boolean;
  allowedOperatorsType?: OgcFilterOperatorType;
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
