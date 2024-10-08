import { Message } from '@igo2/core/message';

import olLayer from 'ol/layer/Layer';
import olSource from 'ol/source/Source';

import { AnyDataSourceOptions } from '../../../datasource/shared/datasources/any-datasource.interface';
import { DataSource } from '../../../datasource/shared/datasources/datasource';
import { MapExtent } from '../../../map/shared/map.interface';
import { LegendOptions } from './legend.interface';

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
  profils?: string[];
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
  /** Default value is true */
  showInMiniBaseMap?: boolean;
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
