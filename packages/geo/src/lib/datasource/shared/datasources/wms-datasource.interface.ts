import olSource from 'ol/source/Source';
import olSourceVector from 'ol/source/Vector';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import type { ServerType } from 'ol/source/wms';

import { DataSourceOptions } from './datasource.interface';
import { WFSDataSourceOptionsParams } from './wfs-datasource.interface';

export interface WMSDataSourceOptions extends DataSourceOptions {
  // type?: 'wms';
  paramsWFS?: WFSDataSourceOptionsParams; // for wms linked with wfs
  urlWfs?: string; // if url for linked wfs differ from the url for wms.
  url: string;
  params: WMSDataSourceOptionsParams;
  crossOrigin?: string;
  projection?: string;
  resolutions?: number[];
  serverType?: ServerType;
  ratio?: number;
  ol?: olSourceVector<OlGeometry> | olSource;
  refreshIntervalSec?: number;
  contentDependentLegend?: boolean;
  excludeAttribute?: Array<string>;
}

export interface WMSDataSourceOptionsParams {
  LAYERS: string;
  VERSION?: string;
  TIME?: string;
  FEATURE_COUNT?: number;
  FILTER?: string;
  INFO_FORMAT?: string;
  DPI?: number;
  MAP_RESOLUTION?: number;
  FORMAT_OPTIONS?: string;
}
