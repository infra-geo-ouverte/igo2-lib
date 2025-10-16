import { Size } from 'ol/size';

import { MapExtent, MapViewOptions } from '../../../map/shared/map.interface';

export interface Legend {
  title?: string;
  urls?: string[];
  htmls?: string[];
  display?: boolean;
}

export interface LegendMapViewOptions extends MapViewOptions {
  scale: number;
  size: Size;
  projection: string;
  extent: MapExtent;
}

export interface ItemStyleOptions {
  name: string;
  title?: string;
}

export interface LegendsSpecifications {
  legends?: Legend[];
  handleLegendMethod?: 'merge' | 'impose';
  updateOnViewChange?: boolean;
}

export interface LegendState {
  id: string;
  state: {
    shown?: boolean;
  };
}
