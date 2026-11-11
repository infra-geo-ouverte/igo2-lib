import { Injectable, Injector, inject } from '@angular/core';

import {
  Layer,
  LayerService,
  OfflineLayerRestore,
  VectorLayerOptions
} from '@igo2/geo';

import { Observable, combineLatest, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { LayerDB } from '../layer';

@Injectable()
export class OfflineLayerRestoreService implements OfflineLayerRestore {
  private readonly layerDB = inject(LayerDB);
  private readonly injector = inject(Injector);

  createAsyncLayers(contextUri = '*'): Observable<Layer[]> {
    const layerService = this.injector.get(LayerService);

    return this.layerDB.getAll().pipe(
      concatMap((persistedLayers) => {
        const filteredPersistedLayers =
          contextUri === '*'
            ? persistedLayers
            : persistedLayers.filter(
                (layer) => layer.detailedContextUri === contextUri
              );

        if (!filteredPersistedLayers.length) {
          return of([]);
        }

        const layerOptions: VectorLayerOptions[] = filteredPersistedLayers.map(
          (persistedLayer) =>
            ({
              ...(persistedLayer.layerOptions as VectorLayerOptions),
              offline: {
                enabled: true,
                contextUri: persistedLayer.detailedContextUri
              },
              sourceOptions: {
                ...persistedLayer.sourceOptions,
                url: persistedLayer.sourceOptions.url ?? persistedLayer.layerId
              } as VectorLayerOptions['sourceOptions']
            }) satisfies VectorLayerOptions
        );

        return combineLatest(
          layerOptions.map((options) => layerService.createAsyncLayer(options))
        ).pipe(map((layers) => layers.filter(Boolean) as Layer[]));
      })
    );
  }
}
