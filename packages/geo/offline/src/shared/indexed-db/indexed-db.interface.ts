import { DBSchema } from 'idb';

import { GeoDBData } from '../../geo/geo-data.interface';
import { LayerDBData } from '../../layer/layer-db.interface';

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
