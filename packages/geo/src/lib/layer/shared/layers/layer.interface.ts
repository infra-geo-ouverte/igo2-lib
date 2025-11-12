import { Message } from '@igo2/core/message';

import olLayer from 'ol/layer/Layer';
import olSource from 'ol/source/Source';

import type {
  AnyDataSourceOptions,
  DataSource
} from '../../../datasource/shared/datasources';
import type { MapExtent } from '../../../map/shared/map.interface';
import type { LegendOptions } from './legend.interface';
import type { LayersLink } from './linked/linked-layer.interface';

export interface LayerOptions extends LayerOptionsBase {
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

export type LayerId = string | number;

export interface LayerOptionsBase {
  id?: LayerId;
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
  parentId?: LayerId;
}

export interface LayerSecurityOptions {
  profils?: string[];
}

export interface GeoWorkspaceOptions {
  srcId?: LayerId;
  workspaceId?: LayerId;
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
