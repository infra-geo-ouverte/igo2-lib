import { Provider } from '@angular/core';

import { CONFIG_TOKEN, DBConfig, NgxIndexedDBService } from 'ngx-indexed-db';

import { ConfigFileToGeoDBService, GeoDBService } from './geoDB';
import { LayerDBService } from './layerDB';
import { IOfflineOptions } from './offline.interface';
import { GeoNetworkService } from './shared';

const dbConfig: DBConfig = {
  name: 'igo2DB',
  version: 2,
  objectStoresMeta: [
    {
      store: 'geoData',
      storeConfig: { keyPath: 'url', autoIncrement: false },
      storeSchema: [
        { name: 'regionID', keypath: 'regionID', options: { unique: false } }
      ]
    },
    {
      store: 'layerData',
      storeConfig: { keyPath: 'layerId', autoIncrement: false },
      storeSchema: [
        {
          name: 'layerOptions',
          keypath: 'layerOptions',
          options: { unique: false }
        },
        {
          name: 'sourceOptions',
          keypath: 'sourceOptions',
          options: { unique: false }
        }
      ]
    }
  ]
};

export function provideOffline(
  options: IOfflineOptions | undefined
): Provider[] {
  if (!options?.enable) {
    return [];
  }

  const dbConfigFormatted = {};
  for (const config of [dbConfig]) {
    Object.assign(dbConfigFormatted, { [config.name]: dbConfig });
  }

  return [
    { provide: CONFIG_TOKEN, useValue: dbConfigFormatted },
    NgxIndexedDBService,
    LayerDBService,
    GeoDBService,
    GeoNetworkService,
    ConfigFileToGeoDBService
  ];
}
