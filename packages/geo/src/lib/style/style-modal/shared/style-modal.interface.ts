import { Feature } from "../../../feature/shared/feature.interfaces";
import { VectorLayer } from "../../../layer/shared/layers/vector-layer";
import { FontType } from "../../shared/font.enum";

export interface StyleModalData {
    fillColor?: string;
    strokeColor?: string;
    fontSize?: string;
    fontStyle?: FontType;
    offsetX?: number;
    offsetY?: number;
}

export interface LayerMatDialogData {
    layer: VectorLayer
}

export interface DrawingMatDialogData {
    features: Feature[]
}
