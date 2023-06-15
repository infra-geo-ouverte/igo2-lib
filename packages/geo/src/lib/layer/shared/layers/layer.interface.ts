import olLayer from 'ol/layer/Layer';
import olSource from 'ol/source/Source';
import { Message } from '@igo2/core';

import { DataSource } from '../../../datasource/shared/datasources/datasource';
import { AnyDataSourceOptions } from '../../../datasource/shared/datasources/any-datasource.interface';
import { MapExtent, MapViewOptions } from '../../../map/shared/map.interface';

export interface LayerOptions {
  isIgoInternalLayer?: boolean; // useful when mapOffline directive set the resolution of the layers.
  source?: DataSource;
  sourceOptions?: AnyDataSourceOptions;
  title?: string;
  id?: string;
  alias?: string;
  security?: LayerSecurityOptions;
  baseLayer?: boolean;
  opacity?: number;
  visible?: boolean;
  extent?: MapExtent;
  zIndex?: number;
  messages?: Message[];
  minResolution?: number;
  maxResolution?: number;
  minScaleDenom?: number;
  maxScaleDenom?: number;
  showInLayerList?: boolean;
  removable?: boolean;
  workspace?: GeoWorkspaceOptions;
  legendOptions?: LegendOptions;
  ol?: olLayer<olSource>;
  tooltip?: TooltipContent;
  _internal?: { [key: string]: string };
  active?: boolean;
  check?: boolean;
  linkedLayers?: LayersLink;
  showButtonZoomToExtent?: boolean;
}

export interface LayerSecurityOptions {
  profils?: string[]
}

export interface GeoWorkspaceOptions {
  srcId?: string;
  workspaceId?: string;
  minResolution?: number;
  maxResolution?: number;
  enabled?: boolean;
  queryOptions?: GeoWorkspaceQueryOptions;
  pageSize?: number;
  pageSizeOptions?: number[];
  searchIndexEnabled?: boolean;
  printable?: boolean;
}

export interface GeoWorkspaceQueryOptions {
  mapQueryOnOpenTab?: boolean;
  tabQuery?: boolean;
}

export interface LayersLink {
  linkId: string;
  links?: LayersLinkProperties[];
}
export interface LayersLinkProperties {
  linkedIds: string[];
  syncedDelete: boolean;
  properties: LinkedProperties[];
}

export enum LinkedProperties {
  OPACITY = 'opacity',
  VISIBLE = 'visible',
  OGCFILTERS = 'ogcFilters',
  MINRESOLUTION = 'minResolution',
  MAXRESOLUTION = 'maxResolution',
  ZINDEX = 'zIndex',
  TIMEFILTER = 'timeFilter'
}

export interface GroupLayers {
  title: string;
  layers?: LayerOptions;
  collapsed?: boolean;
}

export interface TooltipContent {
  type?: TooltipType;
  text?: string;
}
export enum TooltipType {
  TITLE = 'title',
  ABSTRACT = 'abstract',
  CUSTOM = 'custom'
}

export interface LegendOptions {
  collapsed?: boolean;
  display?: boolean;
  url?: string;
  html?: string;
  stylesAvailable?: ItemStyleOptions[];
}

export interface LegendMapViewOptions extends MapViewOptions{
  scale?: number;
  size?: [number, number];
}

export interface ItemStyleOptions {
  name: string;
  title?: string;
}

export interface OutputLayerLegend {
  title: string;
  url: string;
  display: boolean;
  isInResolutionsRange: boolean;
}
