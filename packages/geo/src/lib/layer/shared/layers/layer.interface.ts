import olLayer from 'ol/layer/Layer';

import { DataSource } from '../../../datasource/shared/datasources/datasource';
import { AnyDataSourceOptions } from '../../../datasource/shared/datasources/any-datasource.interface';

export interface LayerOptions {
  source?: DataSource;
  sourceOptions?: AnyDataSourceOptions;
  title?: string;
  id?: string;
  alias?: string;
  baseLayer?: boolean;
  opacity?: number;
  visible?: boolean;
  extent?: [number, number, number, number];
  zIndex?: number;
  minResolution?: number;
  maxResolution?: number;
  minScaleDenom?: number;
  maxScaleDenom?: number;
  showInLayerList?: boolean;
  removable?: boolean;
  legendOptions?: LegendOptions;
  ol?: olLayer;
  tooltip?: TooltipContent;
  _internal?: { [key: string]: string };
  active?: boolean;
  check?: boolean;
  linkedLayers?: LayersLink;
}

export interface LayersLink {
  linkId: string;
  links?: LayersLinkProperties[];
  computedLinks?: ComputedLink[];
}
export interface LayersLinkProperties {
  bidirectionnal?: boolean;
  linkedIds: string[];
  syncedDelete: boolean;
  properties: string[]; // opacity,visible,ogcFilters,minResolution, maxResolution, zIndex
  // TODO timeFilter
  // TODO Sourcefields at layer creation because it is a static property
}

export interface ComputedLink {
  srcId: string;
  dstId: string;
  properties: string[]; // opacity,visible,ogcFilters,minResolution, maxResolution, zIndex
  // TODO timeFilter
  // TODO Sourcefields at layer creation because it is a static property
  bidirectionnal?: boolean;
  srcProcessed?: boolean;
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

export interface ItemStyleOptions {
  name: string;
  title?: string;
}

export interface OutputLayerLegend {
  title: string;
  url: string;
  image: string;
}
