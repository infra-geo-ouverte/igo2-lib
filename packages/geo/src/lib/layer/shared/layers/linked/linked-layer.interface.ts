import type { AnyLayer } from '../any-layer';
import type { Layer } from '../layer';
import { LayerId } from '../layer.interface';

export type AnyPropertyOptions = ZindexPropertyOptions | BasePropertyOptions;

export interface ZindexPropertyOptions extends BasePropertyOptions {
  initialOrder: AnyLayer[];
}

interface BasePropertyOptions {
  layers: Layer[];
}

export interface LayersLink {
  linkId: LayerId;
  /** Default value is true */
  showInMiniBaseMap?: boolean;
  links?: LayersLinkProperties[];
}
export interface LayersLinkProperties {
  bidirectionnal?: boolean;
  linkedIds: LayerId[];
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
