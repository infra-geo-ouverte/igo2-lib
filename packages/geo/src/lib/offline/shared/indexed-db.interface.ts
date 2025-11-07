import { DBSchema } from 'idb';

import { GeoDBData } from '../geoDB/geoDB.interface';
import { LayerDBData } from '../layerDB/layerDB.interface';

export interface IgoDBSchema extends DBSchema {
  geoData: {
    value: GeoDBData;
    key: string;
    indexes: { 'regionID-idx': string };
  };
  layerData: {
    value: LayerDBData;
    key: string;
  };
}
