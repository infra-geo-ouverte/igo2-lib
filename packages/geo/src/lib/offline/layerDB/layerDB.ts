import { IDBPDatabase } from 'idb';
import { Observable, from } from 'rxjs';
import { concatMap, first, map, mergeMap, switchMap } from 'rxjs/operators';

import { IgoDBSchema } from '../shared/indexed-db.interface';
import { createIndexedDb } from '../shared/indexed-db.utils';
import { LayerDBData } from './layerDB.interface';

export class LayerDB {
  private db$: Observable<IDBPDatabase<IgoDBSchema>>;

  constructor() {
    this.db$ = createIndexedDb();
  }
  /**
   * This method allow to update the stored layer into the indexeddb (layerData)
   * @param layerDBData
   * @returns
   */
  update(layerDBData: LayerDBData): Observable<LayerDBData> {
    return this.db$.pipe(
      switchMap((db) =>
        this.getByID(layerDBData.layerId).pipe(
          first(),
          concatMap((dbObject: LayerDBData) => {
            if (!dbObject) {
              return from(db.add('layerData', layerDBData)).pipe(
                map(() => layerDBData)
              );
            } else {
              return this.customUpdate(layerDBData);
            }
          })
        )
      )
    );
  }

  private customUpdate(layerDBData: LayerDBData): Observable<LayerDBData> {
    const b = this.delete(layerDBData.layerId).pipe(
      mergeMap(() => this.add(layerDBData))
    );
    return b;
  }

  add(layerDBData: LayerDBData): Observable<LayerDBData> {
    return this.db$.pipe(
      switchMap((db) =>
        from(db?.add('layerData', layerDBData)).pipe(map(() => layerDBData))
      )
    );
  }

  /**
   * This method retrieve an idb layer definition
   * @param layerId
   * @returns
   */
  getByID(layerId: string): Observable<LayerDBData> {
    return this.db$.pipe(
      switchMap((db) => from(db?.get('layerData', layerId)))
    );
  }

  /**
   * This method delete an idb layer definition
   * @param key
   * @returns
   */
  delete(key: string): Observable<object> {
    return this.db$.pipe(
      switchMap((db) => from(db?.delete('layerData', key))),
      map(() => {
        {
          return { key };
        }
      })
    );
  }

  /** @deprecated Use delete method instead*/
  deleteByKey(key: string): Observable<object> {
    return this.delete(key);
  }

  /**
   * This method retrive all idb layer definition
   * @param layerId
   * @returns
   */
  getAll(): Observable<LayerDBData[]> {
    return this.db$.pipe(switchMap((db) => from(db?.getAll('layerData'))));
  }
}
