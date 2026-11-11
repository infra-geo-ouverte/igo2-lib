import { Injectable, inject } from '@angular/core';

import type { AnyLayer, LayerPersistence, VectorLayerOptions } from '@igo2/geo';

import { forkJoin } from 'rxjs';

import { GeoDB } from '../../geo';
import { LayerDB } from '../../layer';

@Injectable()
export class IndexedDbLayerPersistenceService implements LayerPersistence {
  private readonly geoDB = inject(GeoDB);
  private readonly layerDB = inject(LayerDB);

  isPersistent(layer: AnyLayer): boolean {
    if (layer.type !== 'vector') {
      return false;
    }

    const options = layer.options as VectorLayerOptions;
    return options.offline?.enabled === true;
  }

  removePersistedData(layer: AnyLayer): void {
    if (!this.isPersistent(layer) || layer.id === undefined) {
      return;
    }

    const options = layer.options as VectorLayerOptions;
    const layerId = layer.id.toString();
    const sourceUrl = options.sourceOptions?.url;
    const featureStorageKey =
      typeof sourceUrl === 'string' && sourceUrl.length > 0
        ? sourceUrl
        : layerId;

    forkJoin([
      this.geoDB.delete(featureStorageKey),
      this.layerDB.delete(layerId)
    ]).subscribe();
  }
}
