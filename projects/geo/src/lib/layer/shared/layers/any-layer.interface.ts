import { LayerOptions } from './layer.interface';
import { ImageLayerOptions } from './image-layer.interface';
import { TileLayerOptions } from './tile-layer.interface';
import { VectorLayerOptions } from './vector-layer.interface';

export type AnyLayerOptions =
  | LayerOptions
  | ImageLayerOptions
  | TileLayerOptions
  | VectorLayerOptions;
