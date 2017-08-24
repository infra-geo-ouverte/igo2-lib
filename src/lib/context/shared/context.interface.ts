import { MapViewOptions } from '../../map';
import { LayerContext } from '../../layer';
import { DataSourceContext } from '../../datasource';
import { Tool } from '../../tool/shared/tool.interface';
import { Scope, TypePermission } from './context.enum';


export interface Context {
  id?: string;
  title?: string;
  uri?: string;
  scope?: Scope; // 'public' | 'protected' | 'private';
  permission?: string; // 'read' | 'write'
  description?: string;
  icon?: string;
}

export interface ContextsList {
  ours: Context[];
  shared?: Context[];
  public?: Context[];
}

export interface DetailedContext extends Context {
  map?: ContextMap;
  layers?: ContextLayer[];
  tools?: Tool[];
  toolbar?: string[];
}

export interface ContextLayer extends LayerContext {
  source: DataSourceContext;
}

export interface ContextMapView extends MapViewOptions {
  keepCurrentView?: boolean;
}

export interface ContextMap  {
  view: ContextMapView;
}

export interface ContextServiceOptions {
  url?: string;
  basePath?: string;
  contextListFile?: string;
  defaultContextUri?: string;
}

export interface ContextPermission  {
  id?: string;
  contextId?: string;
  profil: string;
  typePermission: TypePermission;
}

export interface ContextPermissionsList  {
  read: ContextPermission[];
  write: ContextPermission[];
}
