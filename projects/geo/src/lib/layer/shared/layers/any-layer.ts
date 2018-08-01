import { ImageLayer } from './image-layer';
import { TileLayer } from './tile-layer';
import { VectorLayer } from './vector-layer';

export type AnyLayer = ImageLayer | TileLayer | VectorLayer;
