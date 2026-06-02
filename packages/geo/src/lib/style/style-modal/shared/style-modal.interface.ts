import { Feature } from '../../../feature/shared/feature.interfaces';
import { VectorLayer } from '../../../layer/shared/layers/vector-layer';
import { VectorTileLayer } from '../../../layer/shared/layers/vectortile-layer';
import { FontType } from '../../shared';

export interface StyleModalLayerData extends StyleModalData {
  strokeWidth?: number;
  field?: string;
  radius?: number;
}

export interface StyleModalLayerData extends StyleModalData {
  strokeWidth?: number;
  field?: string;
  radius?: number;
}

export interface StyleModalData {
  fillColor?: string;
  strokeColor?: string;
  fontSize?: string;
  fontStyle?: FontType;
  offsetX?: number;
  offsetY?: number;
}

export interface LayerMatDialogData {
  layer: VectorLayer | VectorTileLayer;
}

export interface DrawingMatDialogData {
  features: Feature[];
}
