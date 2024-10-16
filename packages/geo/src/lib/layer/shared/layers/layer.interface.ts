import { Message } from '@igo2/core/message';

import olLayer from 'ol/layer/Layer';
import olSource from 'ol/source/Source';

import {
  AnyDataSourceOptions,
  DataSource
} from '../../../datasource/shared/datasources';
import { MapExtent } from '../../../map/shared/map.interface';
import { LegendOptions } from './legend.interface';

export interface LayerOptions extends BaseLayerOptions {
  isIgoInternalLayer?: boolean; // useful when mapOffline directive set the resolution of the layers.
  source?: DataSource;
  sourceOptions?: AnyDataSourceOptions;
  alias?: string;
  security?: LayerSecurityOptions;
  baseLayer?: boolean;
  messages?: Message[];
  minScaleDenom?: number;
  maxScaleDenom?: number;
  removable?: boolean;
  workspace?: GeoWorkspaceOptions;
  legendOptions?: LegendOptions;
  ol?: olLayer<olSource>;
  tooltip?: TooltipContent;
  _internal?: Record<string, string>;
  linkedLayers?: LayersLink;
  showButtonZoomToExtent?: boolean;
}

export interface BaseLayerOptions {
  id?: string | number;
  /**
   * An unique identifier calculated client side
   * The name prop provide a way to have a unique identifier between all layers
   **/
  name?: string;
  title?: string;
  opacity?: number;
  visible?: boolean;
  extent?: MapExtent;
  zIndex?: number;
  minResolution?: number;
  maxResolution?: number;
  showInLayerList?: boolean;
  parentId?: string;
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
  bidirectionnal?: boolean;
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

export interface TooltipContent {
  type?: TooltipType;
  text?: string;
}
export enum TooltipType {
  TITLE = 'title',
  ABSTRACT = 'abstract',
  CUSTOM = 'custom'
}
export type LayerType = 'vector' | 'raster' | 'group';
