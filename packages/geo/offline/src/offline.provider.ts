import {
  EnvironmentProviders,
  Provider,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer
} from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import {
  LAYER_PERSISTENCE,
  OFFLINE_LAYER_RESTORE,
  VECTOR_LAYER_EXTENSIONS
} from '@igo2/geo';

import { GeoDB, GeoDataSyncService } from './geo';
import { LayerDB } from './layer';
import { OfflineFeature, OfflineFeatureKind } from './offline.interface';
import { GeoNetworkService } from './shared';
import {
  IndexedDbLayerPersistenceService,
  IndexedDbVectorLayerExtension,
  createIndexedDb
} from './shared/indexed-db';
import { OfflineLayerRestoreService } from './shared/offline-layer-restore.service';

export function provideOffline(
  ...features: OfflineFeature<OfflineFeatureKind>[]
): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [];
  for (const feature of features) {
    providers.push(...feature.providers);
  }
  return makeEnvironmentProviders(providers);
}

export function withIndexedDb(): OfflineFeature<'IndexedDb'> {
  return {
    kind: 'IndexedDb',
    providers: [
      provideAppInitializer(indexedDbInitializerFactory),
      provideAppInitializer(configFileToGeoDBInitializerFactory),
      GeoDB,
      LayerDB,
      GeoNetworkService,
      GeoDataSyncService,
      IndexedDbLayerPersistenceService,
      {
        provide: LAYER_PERSISTENCE,
        useExisting: IndexedDbLayerPersistenceService
      },
      OfflineLayerRestoreService,
      {
        provide: OFFLINE_LAYER_RESTORE,
        useExisting: OfflineLayerRestoreService
      },
      IndexedDbVectorLayerExtension,
      {
        provide: VECTOR_LAYER_EXTENSIONS,
        useExisting: IndexedDbVectorLayerExtension,
        multi: true
      }
    ]
  };
}

function indexedDbInitializerFactory() {
  inject(GeoDB);
  inject(LayerDB);
  return createIndexedDb();
}

async function configFileToGeoDBInitializerFactory() {
  const configService = inject(ConfigService);
  const configFileToGeoDBService = inject(GeoDataSyncService);

  await new Promise<void>((resolve) => {
    configService.isLoaded$.subscribe((loaded) => {
      if (loaded) {
        resolve();
      }
    });
  });

  const url: string | undefined = configService.getConfig(
    'importExport.configFileToGeoDBService'
  );
  if (url) {
    configFileToGeoDBService.load(url);
  }
}
