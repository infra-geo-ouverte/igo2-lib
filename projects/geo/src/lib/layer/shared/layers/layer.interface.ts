import * as ol from 'openlayers';

export interface LayerOptions extends ol.olx.layer.BaseOptions {
  title?: string;
  id?: string;
  baseLayer?: boolean;
  source: any;
  // zIndex?: number;
  // visible?: boolean;
  // view?: ol.olx.layer.BaseOptions;
  // minScaleDenom?: number;
  // maxScaleDenom?: number;
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
