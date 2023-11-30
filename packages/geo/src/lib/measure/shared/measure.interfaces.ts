import { Feature } from '../../feature/shared/feature.interfaces';
import { IgoMap } from '../../map/shared/map';

export interface Measure {
  area?: number;
  length?: number;
  lengths?: number[];
}

export interface MeasurerDialogData {
  area: number;
  length: number;
  perimeter: number;
}

export interface FeatureWithMeasure
  extends Feature<FeatureWithMeasureProperties> {}

export interface FeatureWithMeasureProperties {
  id: string;
  measure: Measure;
}

export interface FeatureStoreMeasureStrategyOptions {
  map: IgoMap;
}
