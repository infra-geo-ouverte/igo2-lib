import * as ol from 'openlayers';
import { LayerOptions, LayerContext } from './layer.interface';

export interface VectorLayerOptions extends LayerOptions {
  view?: ol.olx.layer.VectorOptions;
  style?: ol.style.Style;
}

export interface VectorLayerContext extends LayerContext {
  view?: ol.olx.layer.VectorOptions;
  style?: {[key: string]: any};
}
