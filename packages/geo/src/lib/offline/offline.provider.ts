import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { provideDB } from '../indexed-db/indexed-db.provider';
import { IOfflineOptions } from './offline.interface';
import { GeoNetworkService } from './shared';

export function provideOffline(options: IOfflineOptions): EnvironmentProviders {
  return makeEnvironmentProviders(
    options?.enable ? [GeoNetworkService, provideDB()] : []
  );
}
