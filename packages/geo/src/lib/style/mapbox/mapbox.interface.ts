import type { EngineLayerStyle } from '../shared/style.base.interface';

export interface MapboxUrlResponse {
  sprite?: unknown;
}

export interface MapboxLayerStyle extends EngineLayerStyle {
  type: 'Mapbox';
  style: MapboxStyle;
}
interface MapboxStyle {
  url: string;
  source: string;
}
