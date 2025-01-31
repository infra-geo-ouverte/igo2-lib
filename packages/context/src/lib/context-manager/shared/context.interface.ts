import { Tool } from '@igo2/common/tool';
import { Message } from '@igo2/core/message';
import { RouteServiceOptions } from '@igo2/core/route';
import {
  AnyLayerOptions,
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
  layers?: AnyLayerOptions[];
  base?: string;
  map?: ContextMap;
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

export const CONTEXT_ROUTE_KEYS_OPTIONS: contextRouteKeysOptions = {
  context: 'ctx',
  urls: 'urls',
  position: 'pos',
  layers: 'layers',
  groups: 'groups',
  center: 'ctr',
  zoom: 'z',
  projection: 'p',
  rotation: 'r',
  opacity: 'o'
};

export interface contextRouteKeysOptions extends RouteServiceOptions {
  context: string;
  urls: string;
  position: string;
  layers: string;
  groups: string;
  center: string;
  zoom: string;
  projection: string;
  rotation: string;
  opacity: string;
}
export interface ContextServiceOptions {
  url?: string;
  basePath?: string;
  contextListFile?: string;
  defaultContextUri?: string;
  shareMapConfig?: contextRouteKeysOptions;
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
