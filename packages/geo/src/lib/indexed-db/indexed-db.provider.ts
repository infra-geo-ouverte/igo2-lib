import { provideHttpClient } from '@angular/common/http';
import {
  APP_INITIALIZER,
  EnvironmentProviders,
  makeEnvironmentProviders
} from '@angular/core';

import { MessageService } from '@igo2/core/message';

import { GeoDBService } from './geoDB/geoDB.service';
import { LayerDBService } from './layerDB/layerDB.service';

export function provideDB(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(),
    MessageService,
    GeoDBService,
    LayerDBService,
    {
      provide: APP_INITIALIZER,
      useFactory: initIndexedDBFactory,
      deps: [GeoDBService, LayerDBService],
      multi: true
    }
  ]);
}
function initIndexedDBFactory(layer: LayerDBService, geo: GeoDBService) {
  return () => [layer, geo];
}
