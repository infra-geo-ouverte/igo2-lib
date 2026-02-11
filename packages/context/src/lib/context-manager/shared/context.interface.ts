import { Tool } from '@igo2/common/tool';
import { Message } from '@igo2/core/message';
import {
  AnyLayerOptions,
  MapAttributionOptions,
  MapExtent,
  MapScaleLineOptions,
  MapViewOptions
} from '@igo2/geo';

import { FeatureCollection } from 'geojson';

export interface Context {
  id?: number;
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

export interface ContextDetailedChanges extends Pick<DetailedContext, 'id'> {
  layers: IProcessChanges<AnyLayerOptions>;
}

export interface IProcessChanges<T> {
  created: T[];
  updated: T[];
  deleted: number[];
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

export interface ContextProfils {
  name: string;
  title: string;
  childs?: ContextProfils[];
}
