import { type ImageLayerOptions } from './image-layer.interface';
import { type LayerGroupOptions } from './layer-group.interface';
import { type LayerOptions } from './layer.interface';
import { type TileLayerOptions } from './tile-layer.interface';
import { type VectorLayerOptions } from './vector-layer.interface';
import { type VectorTileLayerOptions } from './vectortile-layer.interface';

export type AnyLayerOptions = AnyLayerItemOptions | LayerGroupOptions;

export type AnyLayerItemOptions =
  | LayerOptions
  | ImageLayerOptions
  | TileLayerOptions
  | VectorLayerOptions
  | VectorTileLayerOptions;
