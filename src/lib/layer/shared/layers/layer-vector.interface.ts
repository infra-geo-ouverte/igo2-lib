import { LayerOptions } from './layer.interface';

export interface VectorLayerOptions extends LayerOptions {
  source?: VectorLayerSource;
  view?: olx.layer.VectorOptions;
  style?: olx.style.StyleOptions;
}

export interface VectorLayerSource extends olx.source.VectorOptions {
 formatType?: string;
 formatOptions?: any;
}
