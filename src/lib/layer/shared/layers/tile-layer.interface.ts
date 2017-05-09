import { LayerOptions, LayerContext } from './layer.interface';

export interface TileLayerOptions extends LayerOptions {
  view?: olx.layer.TileOptions;
}

export interface TileLayerContext extends LayerContext {
  view?: olx.layer.TileOptions;
}
