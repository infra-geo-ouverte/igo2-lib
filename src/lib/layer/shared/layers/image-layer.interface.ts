import { LayerOptions, LayerContext } from './layer.interface';

export interface ImageLayerOptions extends LayerOptions {
  view?: ol.olx.layer.ImageOptions;
  token?: string;
}

export interface ImageLayerContext extends LayerContext {
  view?: ol.olx.layer.ImageOptions;
  token?: string;
}
