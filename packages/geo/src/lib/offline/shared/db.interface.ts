import { DBSchema } from 'idb';

import { GeoDBData } from '../geoDB/geoDB.interface';
import { LayerDBData } from '../layerDB/layerDB.interface';

export interface Igo2DBSchema extends DBSchema {
  layerData: {
    value: LayerDBData;
    key: string;
    indexes: { layerOptionsIdx: string; sourceOptionsIdx: string };
  };
  geoData: {
    value: GeoDBData;
    key: string;
    indexes: { regionIDIdx: string };
  };
}
