import type { AnyLayer } from '../any-layer';
import type { Layer } from '../layer';

export type AnyPropertyOptions = ZindexPropertyOptions | BasePropertyOptions;

export interface ZindexPropertyOptions extends BasePropertyOptions {
  initialOrder: AnyLayer[];
}

interface BasePropertyOptions {
  layers: Layer[];
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
  DISPLAYED = 'displayed',
  OGCFILTERS = 'ogcFilters',
  MINRESOLUTION = 'minResolution',
  MAXRESOLUTION = 'maxResolution',
  ZINDEX = 'zIndex',
  TIMEFILTER = 'timeFilter',
  REFRESH = 'refresh'
}
