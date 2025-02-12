import type { ServerType } from 'ol/source/wms';

import type { OgcFiltersOptions } from '../../../filter';
import type { TimeFilterOptions } from '../../../filter/shared/time-filter.interface';
import type { DataSourceOptions } from './datasource.interface';
import type { WFSDataSourceOptionsParams } from './wfs-datasource.interface';

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
  refreshIntervalSec?: number;
  contentDependentLegend?: boolean;
  excludeAttribute?: string[];
  ogcFilters?: OgcFiltersOptions;
  timeFilter?: TimeFilterOptions;
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

export interface TimeFilterableDataSourceOptions extends WMSDataSourceOptions {
  timeFilterable?: boolean;
  timeFilter?: TimeFilterOptions;
}
