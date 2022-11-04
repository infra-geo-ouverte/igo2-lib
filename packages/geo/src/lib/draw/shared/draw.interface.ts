import { Feature } from '../../feature/shared/feature.interfaces';
import { IgoMap } from '../../map/shared/map';

export interface DrawOptions {
  icons?: string[];
}

export interface Draw {
  area?: number;
  length?: number;
  lengths?: number[];
}

export interface DrawingStyle {
  fill?: string;
  stroke?: string;
}

export interface FeatureWithDraw extends Feature<FeatureWithDrawProperties> {}

export interface FeatureWithDrawProperties {
  id: string;
  draw: string;
  longitude: number;
  latitude: number;
  rad: number;
  fontStyle: string;
  drawingStyle: DrawingStyle;
  offsetX: number;
  offsetY: number;
}

export interface FeatureStoreDrawStrategyOptions {
  map: IgoMap;
}
