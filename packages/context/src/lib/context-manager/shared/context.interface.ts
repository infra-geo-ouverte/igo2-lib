import { Message } from '@igo2/core';
import { Tool } from '@igo2/common';
import { MapViewOptions, LayerOptions } from '@igo2/geo';

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
}

export interface ContextsList {
  ours: Context[];
  shared?: Context[];
  public?: Context[];
}

export interface DetailedContext extends Context {
  base?: string;
  map?: ContextMap;
  layers?: LayerOptions[];
  tools?: Tool[];
  toolbar?: string[];
  message?: Message;
  removeLayersOnContextChange?: boolean;
}

export interface ContextMapView extends MapViewOptions {
  keepCurrentView?: boolean;
}

export interface ContextMap {
  view: ContextMapView;
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
  typePermission: TypePermission;
}

export interface ContextPermissionsList {
  read: ContextPermission[];
  write: ContextPermission[];
}
