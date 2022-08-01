import { Feature } from '../../feature/shared/feature.interfaces';
import { IgoMap } from '../../map/shared/map';
import { DrawControl } from '../../geometry/shared/controls/draw';
import { FeatureStore } from '../../feature';
import { CoordinatesUnit, LabelType } from '../shared/draw.enum';
import { MeasureAreaUnit, MeasureLengthUnit } from '../../measure/shared/measure.enum'

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
  labelType: LabelType;
  measureUnit: MeasureLengthUnit | MeasureAreaUnit | CoordinatesUnit;
}

export interface FeatureStoreDrawStrategyOptions {
  map: IgoMap;
}

export interface StoreAndDrawControl {
  store: FeatureStore<FeatureWithDraw>;
  drawControl: DrawControl;
}
