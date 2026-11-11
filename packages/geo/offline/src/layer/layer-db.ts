import type { LayerId } from '@igo2/geo';

import { IDBPDatabase } from 'idb';
import { Observable, from } from 'rxjs';

import { IgoDBSchema } from '../shared/indexed-db/indexed-db.interface';
import { createIndexedDb } from '../shared/indexed-db/indexed-db.utils';
import { LayerDBData } from './layer-db.interface';

export class LayerDB {
  private readonly dbPromise: Promise<IDBPDatabase<IgoDBSchema>>;

  constructor() {
    this.dbPromise = createIndexedDb();
  }
  /**
   * This method allow to update the stored layer into the indexeddb (layerData)
   * @param layerDBData
   * @returns
   */
  update(layerDBData: LayerDBData): Observable<LayerDBData> {
    return from(this.updateAsync(layerDBData));
  }

  private async updateAsync(layerDBData: LayerDBData): Promise<LayerDBData> {
    const db = await this.dbPromise;
    const existing = await db.get('layerData', layerDBData.layerId);
    if (existing) {
      await db.delete('layerData', layerDBData.layerId);
    }
    await db.add('layerData', layerDBData);
    return layerDBData;
  }

  add(layerDBData: LayerDBData): Observable<LayerDBData> {
    return from(this.addAsync(layerDBData));
  }

  private async addAsync(layerDBData: LayerDBData): Promise<LayerDBData> {
    const db = await this.dbPromise;
    await db.add('layerData', layerDBData);
    return layerDBData;
  }

  /**
   * This method retrieve an idb layer definition
   * @param layerId
   * @returns
   */
  getByID(layerId: LayerId): Observable<LayerDBData | undefined> {
    return from(this.getByIDAsync(layerId));
  }

  private async getByIDAsync(
    layerId: LayerId
  ): Promise<LayerDBData | undefined> {
    const db = await this.dbPromise;
    return db.get('layerData', layerId.toString());
  }

  /**
   * This method delete an idb layer definition
   * @param key
   * @returns
   */
  delete(key: string): Observable<object> {
    return from(this.deleteAsync(key));
  }

  private async deleteAsync(key: string): Promise<object> {
    const db = await this.dbPromise;
    await db.delete('layerData', key);
    return { key };
  }

  /**
   * This method retrive all idb layer definition
   * @param layerId
   * @returns
   */
  getAll(): Observable<LayerDBData[]> {
    return from(this.getAllAsync());
  }

  private async getAllAsync(): Promise<LayerDBData[]> {
    const db = await this.dbPromise;
    return db.getAll('layerData');
  }
}
