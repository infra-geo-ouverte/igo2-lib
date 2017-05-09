import { LayerOptions, LayerContext } from './layer.interface';

export interface ImageLayerOptions extends LayerOptions {
  view?: olx.layer.ImageOptions;
}

export interface ImageLayerContext extends LayerContext {
  view?: olx.layer.ImageOptions;
}
