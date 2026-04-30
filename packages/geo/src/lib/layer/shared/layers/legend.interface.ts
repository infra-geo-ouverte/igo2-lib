import { MapViewOptions } from '../../../map/shared/map.interface';

export interface LegendOptions {
  collapsed?: boolean;
  display?: boolean;
  url?: string;
  html?: string;
  stylesAvailable?: ItemStyleOptions[];
}

export interface LegendMapViewOptions extends MapViewOptions {
  scale?: number;
  size?: [number, number];
}

export interface ItemStyleOptions {
  name: string;
  title?: string;
}

export interface OutputLayerLegend {
  title: string;
  url: string;
  display: boolean;
  isInResolutionsRange: boolean;
}
