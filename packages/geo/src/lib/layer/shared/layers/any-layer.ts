import { ImageLayer } from './image-layer';
import { Layer } from './layer';
import { TileLayer } from './tile-layer';
import { VectorLayer } from './vector-layer';
import { VectorTileLayer } from './vectortile-layer';

export type AnyLayer =
  | Layer
  | ImageLayer
  | TileLayer
  | VectorLayer
  | VectorTileLayer;
