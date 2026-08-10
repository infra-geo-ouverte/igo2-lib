import { AnyDataSourceOptions, AnyLayerOptions } from '@igo2/geo';

export interface LayerDBData {
  layerId: string;
  layerOptions: AnyLayerOptions;
  sourceOptions: AnyDataSourceOptions;
  insertEvent: string;
  detailedContextUri: string;
}
