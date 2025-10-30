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
  // refer to import { LayerId } from './layer.interface'; prevent circular dependency!
  id: string | number;
  shown?: boolean;
}
