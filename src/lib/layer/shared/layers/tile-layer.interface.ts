import { LayerOptions } from './layer.interface';

export interface TileLayerOptions extends LayerOptions {
  view?: olx.layer.TileOptions;
}
