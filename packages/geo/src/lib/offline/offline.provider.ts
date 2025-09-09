import {
  APP_INITIALIZER,
  EnvironmentProviders,
  makeEnvironmentProviders
} from '@angular/core';

import { ConfigFileToGeoDBService, GeoDB } from './geoDB';
import { LayerDB } from './layerDB';
import { IOfflineOptions } from './offline.interface';
import { GeoNetworkService } from './shared';
import { createIndexedDb } from './shared/indexed-db.utils';

export function provideOffline(options: IOfflineOptions): EnvironmentProviders {
  return makeEnvironmentProviders(
    options?.enable
      ? [
          {
            provide: APP_INITIALIZER,
            useFactory: idbFactory,
            multi: true,
            deps: [GeoDB, LayerDB]
          },
          GeoDB,
          LayerDB,
          GeoNetworkService,
          ConfigFileToGeoDBService
        ]
      : []
  );
}

function idbFactory() {
  return () => createIndexedDb();
}
