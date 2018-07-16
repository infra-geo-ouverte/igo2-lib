
import { LayerOptions, LayerContext } from './layer.interface';

export interface TileLayerOptions extends LayerOptions {
  view?: ol.olx.layer.TileOptions;
}

export interface TileLayerContext extends LayerContext {
  view?: ol.olx.layer.TileOptions;
}
