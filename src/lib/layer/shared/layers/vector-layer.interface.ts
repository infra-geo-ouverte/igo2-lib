import { LayerOptions, LayerContext } from './layer.interface';

export interface VectorLayerOptions extends LayerOptions {
  view?: olx.layer.VectorOptions;
  style?: ol.style.Style;
}

export interface VectorLayerContext extends LayerContext {
  view?: olx.layer.VectorOptions;
  style?: {[key: string]: any};
}
