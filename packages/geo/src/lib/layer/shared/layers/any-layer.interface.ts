import { ImageLayerOptions } from './image-layer.interface';
import { LayerOptions } from './layer.interface';
import { TileLayerOptions } from './tile-layer.interface';
import { VectorLayerOptions } from './vector-layer.interface';
import { VectorTileLayerOptions } from './vectortile-layer.interface';

export type AnyLayerOptions =
  | LayerOptions
  | ImageLayerOptions
  | TileLayerOptions
  | VectorLayerOptions
  | VectorTileLayerOptions;
