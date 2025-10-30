import type { BaseLayerStyle } from '../shared/style.interface';

export interface MapboxUrlResponse {
  sprite?: unknown;
}

export interface MapboxLayerStyle extends BaseLayerStyle {
  editable: false;
  type: 'Mapbox';
  style: MapboxStyle;
}
export interface MapboxStyle {
  url: string;
  source: string;
}

declare module '../shared/style.interface' {
  interface LayerStyleRegistry {
    Mapbox: MapboxLayerStyle;
  }
}
