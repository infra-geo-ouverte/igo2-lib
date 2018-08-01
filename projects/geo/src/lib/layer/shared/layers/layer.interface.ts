import LayerOL from 'ol/layer/Layer';

import { AnyDataSource } from '../../../datasource/shared/datasources/any-datasource';
// import { AnyDataSourceOptions } from '../../../datasource/shared/datasources/any-datasource.interface';

export interface LayerOptions {
  source?: AnyDataSource;
  // sourceOptions?: AnyDataSourceOptions;
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
