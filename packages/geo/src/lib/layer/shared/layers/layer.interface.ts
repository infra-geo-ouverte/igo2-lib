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
  showInLayerList?: boolean;
  removable?: boolean;
  ol?: olLayer;
  tooltip?: TooltipContent;
}

export interface GroupLayers {
  title: string;
  layers?: LayerOptions;
  collapsed?: boolean;
}

export interface LayerLegend {
  title: string;
  url: string;
  image: string;
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
