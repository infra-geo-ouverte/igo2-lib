import type { EngineLayerStyle } from '../shared/style.interface';

export interface MapboxUrlResponse {
  sprite?: string | unknown;
}

export interface MapboxLayerStyle extends EngineLayerStyle<MapboxStyle> {
  type: 'Mapbox';
  style: MapboxStyle;
}
interface MapboxStyle {
  url: string;
  source: string;
}
