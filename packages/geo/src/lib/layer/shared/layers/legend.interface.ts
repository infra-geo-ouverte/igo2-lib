import { LayerId } from './layer.interface';

export interface Legend {
  title?: string;
  url?: string;
  html?: string;
}

export interface LegendsSpecifications {
  legends?: Legend[];
  handleLegendMethod?: 'merge' | 'impose';
}

export interface LegendState {
  id: LayerId;
  shown?: boolean;
}
