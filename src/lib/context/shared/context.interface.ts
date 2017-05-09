import { MapViewOptions } from '../../map';
import { LayerContext } from '../../layer';
import { DataSourceContext } from '../../datasource';
import { Tool } from '../../tool/shared/tool.interface';


export interface Context {
  title: string;
  uri: string;
  scope?: 'public' | 'protected' | 'private';
  description?: string;
  icon?: string;
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
  basePath: string;
  contextListFile: string;
}
