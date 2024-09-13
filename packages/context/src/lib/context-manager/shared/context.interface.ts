import { Tool } from '@igo2/common/tool';
import { Message } from '@igo2/core/message';
import {
  AnyDataSourceOptions,
  LayerOptions,
  MapAttributionOptions,
  MapExtent,
  MapScaleLineOptions,
  MapViewOptions
} from '@igo2/geo';

import { FeatureCollection } from 'geojson';

import { TypePermission } from './context.enum';

export interface Context {
  id?: string;
  title?: string;
  uri?: string;
  scope?: string; // Scope: 'public' | 'protected' | 'private';
  permission?: string; // TypePermission: 'read' | 'write'
  description?: string;
  icon?: string;
  iconImage?: string;
  hidden?: boolean;
  imported?: boolean;
}

export interface ContextsList {
  ours: Context[];
  shared?: Context[];
  public?: Context[];
}

export type ExtraFeatures = FeatureCollection & {
  name: string;
  opacity: number;
  visible: boolean;
};
export interface DetailedContext extends Context {
  base?: string;
  map?: ContextMap;
  layers?: LayerOptions[];
  tools?: Tool[];
  toolbar?: string[];
  message?: Message;
  messages?: Message[];
  removeLayersOnContextChange?: boolean;
  extraFeatures?: ExtraFeatures[];
}

export interface ContextMapView extends MapViewOptions {
  keepCurrentView?: boolean;
  homeExtent?: ContextHomeExtent;
}

export interface ContextHomeExtent {
  extent?: MapExtent;
  center?: [number, number];
  zoom?: number;
}

export interface ContextMap {
  view: ContextMapView;
  controls?: {
    scaleLine?: boolean | MapScaleLineOptions;
    attribution?: boolean | MapAttributionOptions;
  };
}

export interface ContextServiceOptions {
  url?: string;
  basePath?: string;
  contextListFile?: string;
  defaultContextUri?: string;
}

export interface ContextPermission {
  id?: string;
  contextId?: string;
  profil: string;
  profilTitle?: string;
  typePermission: TypePermission;
}

export interface ContextPermissionsList {
  read: ContextPermission[];
  write: ContextPermission[];
}

export interface ContextUserPermission {
  name: string;
  checked: boolean;
  indeterminate?: boolean;
}

export interface ContextProfils {
  name: string;
  title: string;
  childs?: ContextProfils[];
}

export interface IContextLayer {
  id?: string;
  layerId?: number;
  contextId?: number;
  layerOptions?:
    | LayerOptions
    | Pick<LayerOptions, 'title' | 'zIndex' | 'visible' | 'security'>;
  sourceOptions?: AnyDataSourceOptions;
}
