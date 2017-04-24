import { MapViewOptions } from '../../map';
import { LayerOptions } from '../../layer';
import { Tool } from '../../tool/shared/tool.interface';


export interface Context {
  title: string;
  uri: string;
  scope?: 'public' | 'protected' | 'private';
  description?: string;
  icon?: string;
}

export interface DetailedContext extends Context {
  map?: MapContext;
  layers?: LayerOptions[];
  tools?: Tool[];
  toolbar?: string[];
}

export interface MapContext  {
  view: MapViewOptions;
}
