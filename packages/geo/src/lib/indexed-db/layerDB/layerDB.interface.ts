import { DBSchema } from 'idb';

export interface LayerDBData {
  layerId: string;
  layerOptions: any;
  sourceOptions: any;
  insertEvent: string;
  detailedContextUri: string;
}

export interface LayerDataDBSchema extends DBSchema {
  layerData: {
    value: LayerDBData;
    key: string;
  };
}
