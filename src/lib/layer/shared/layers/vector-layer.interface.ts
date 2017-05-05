import { LayerOptions } from './layer.interface';

export interface VectorLayerOptions extends LayerOptions {
  view?: olx.layer.VectorOptions;
  style?: any;
}
