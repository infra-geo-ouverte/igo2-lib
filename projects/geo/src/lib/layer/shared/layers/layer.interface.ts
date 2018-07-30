import LayerOL from 'ol/layer/Laver';

import { DataSourceOptions } from '../../../datasource/shared/datasources/datasource.interface';

export interface LayerOptions {
  source: DataSourceOptions;
  title?: string;
  id?: string;
  baseLayer?: boolean;
  opacity?: number;
  visible?: boolean;
  extent?: [number, number, number, number];
  zIndex?: number;
  minResolution?: number;
  maxResolution?: number;
  ol?: LayerOL;
}

export interface LayerCatalog {
  title: string;
  type: string;
  url: string;
  params: {
    layers: string;
  };
}

export interface GroupLayers {
  title: string;
  layers?: LayerCatalog;
  collapsed?: boolean;
}
