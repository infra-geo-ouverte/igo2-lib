import { Injectable } from '@angular/core';

import { IDBPDatabase, openDB } from 'idb';
import { Observable, from } from 'rxjs';
import { concatMap, first, map, mergeMap, switchMap } from 'rxjs/operators';

import { LayerDBData, LayerDataDBSchema } from './layerDB.interface';

@Injectable()
export class LayerDBService {
  private databaseName = 'layerdata-db';
  private databaseVersion = 1;
  private db$: Observable<IDBPDatabase<LayerDataDBSchema>>;

  constructor() {
    this.db$ = this.createLayerDataDb();
  }

  private createLayerDataDb(): Observable<IDBPDatabase<LayerDataDBSchema>> {
    return from(
      openDB<LayerDataDBSchema>(this.databaseName, this.databaseVersion, {
        upgrade(db) {
          db.createObjectStore('layerData', {
            keyPath: 'layerId',
            autoIncrement: false
          });
        }
      })
    );
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
