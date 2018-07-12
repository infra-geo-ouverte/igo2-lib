import * as ol from 'openlayers';

export interface LayerOptions extends ol.olx.layer.BaseOptions {
  title?: string;
  zIndex?: number;
  visible?: boolean;
  view?: ol.olx.layer.BaseOptions;
  baseLayer?: boolean;
  id?: string;
  minScaleDenom?: number;
  maxScaleDenom?: number;
}

export interface LayerContext extends LayerOptions {}

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
