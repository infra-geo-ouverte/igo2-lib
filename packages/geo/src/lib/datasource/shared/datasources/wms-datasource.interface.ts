import { ProjectionLike } from 'ol/proj';
import type { ServerType } from 'ol/source/wms';

import type { OgcFiltersOptions } from '../../../filter';
import type { TimeFilterOptions } from '../../../filter/shared/time-filter.interface';
import { MapExtent } from '../../../map/shared/map.interface';
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
  STYLES?: string;
}

export interface WMSDataSourceOptionsGetLegendGraphicParams {
  LAYER?: string;
  STYLE?: string;
  SCALE?: number;
  SLD?: string;
  SLD_BODY?: string;
  SLD_VERSION: string;
  FORMAT?: string;
  WIDTH?: number;
  HEIGHT?: number;
  VERSION?: string;
  BBOX?: string;
  CRS?: string;
  SRS?: string;
}

export interface TimeFilterableDataSourceOptions extends WMSDataSourceOptions {
  timeFilterable?: boolean;
  timeFilter?: TimeFilterOptions;
}

export interface WmsLayerFromCapabilitiesParsing {
  Abstract?: string;
  Attribution?: string;
  BoundingBox?: unknown[];
  CRS?: ProjectionLike[];
  DataURL?: UrlObjectFromCapabilities[];
  Dimension?: unknown;
  EX_GeographicBoundingBox?: MapExtent;
  KeywordList?: unknown;
  MaxScaleDenominator?: number;
  MetadataURL?: UrlObjectFromCapabilities[];
  MinScaleDenominator?: number;

  Name?: string;
  Style?: WmsCapabilitiesParsedLayerStyleObject[];
  Title?: string;
  cascaded?: number;
  fixedHeight?: number;
  fixedWidth?: number;
  // unknown usage noSubsets?: boolean
  opaque?: boolean;
  queryable?: boolean;
}

interface UrlObjectFromCapabilities {
  Format?: string;
  OnlineResource?: string;
}

export interface WmsCapabilitiesParsedLayerStyleObject {
  Name?: string;
  Title?: string;
  LegendURL?: UrlObjectFromCapabilities[];
}
