import { Feature } from '../../../feature/shared/feature.interfaces';
import { VectorLayer } from '../../../layer/shared/layers/vector-layer';
import { VectorTileLayer } from '../../../layer/shared/layers/vectortile-layer';
import { FontType } from '../../shared/font.enum';
import { GeostylerStyleInterfaceOptions } from '../../shared/layer/layer-style.interface';

export interface StyleModalData {
  fillColor?: string;
  strokeColor?: string;
  fontSize?: string;
  fontStyle?: FontType;
  offsetX?: number;
  offsetY?: number;
  gsStyle?: GeostylerStyleInterfaceOptions;
}

export interface LayerMatDialogData {
  layer: VectorLayer | VectorTileLayer;
}

export interface DrawingMatDialogData {
  features: Feature[];
}
