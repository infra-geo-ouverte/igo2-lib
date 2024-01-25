import { Injectable } from '@angular/core';

import { IDBPDatabase } from 'idb';
import { Observable, Subject, from, of } from 'rxjs';
import { concatMap, first, switchMap } from 'rxjs/operators';

import { Igo2DBSchema } from '../shared/db.interface';
import { createDb } from '../shared/db.utils';
import { LayerDBData } from './layerDB.interface';

@Injectable({
  providedIn: 'root'
})
export class LayerDBService {
  readonly objectStore: string = 'layerData';
  private db: IDBPDatabase<Igo2DBSchema>;
  constructor() {
    this.waitForDb().then();
  }

  private async waitForDb(): Promise<void> {
    if (!this.db) {
      this.db = await createDb();
    }
    return;
  }

  /**
   * This method allow to update the stored layer into the indexeddb (layerData)
   * @param layerDBData
   * @returns
   */
  update(layerDBData: LayerDBData): Observable<LayerDBData> {
    const subject: Subject<LayerDBData> = new Subject();
    this.getByID(layerDBData.layerId)
      .pipe(
        first(),
        concatMap((dbObject: LayerDBData) => {
          if (!dbObject) {
            return from(
              this.waitForDb().then(() =>
                this.db.add('layerData', layerDBData).then(() => layerDBData)
              )
            );
          } else {
            return this.customUpdate(layerDBData);
          }
        })
      )
      .subscribe((response) => {
        subject.next(response);
        subject.complete();
      });
    return subject;
  }

  private customUpdate(layerDBData: LayerDBData): Observable<LayerDBData> {
    const subject: Subject<LayerDBData> = new Subject();
    const deleteRequest = this.deleteByKey(layerDBData.layerId);
    deleteRequest
      .pipe(
        concatMap((isDeleted) =>
          isDeleted
            ? from(
                this.waitForDb().then(() =>
                  this.db.add('layerData', layerDBData).then(() => layerDBData)
                )
              )
            : of(undefined)
        )
      )
      .subscribe((object) => {
        if (object) {
          subject.next(object);
        }
        subject.complete();
      });
    return subject;
  }

  /**
   * This method retrieve an idb layer definition
   * @param layerId
   * @returns
   */
  getByID(layerId: string): Observable<LayerDBData> {
    return from(this.waitForDb().then(() => this.db.get('layerData', layerId)));
  }

  /**
   * This method delete an idb layer definition
   * @param layerId
   * @returns
   */
  deleteByKey(layerId: string): Observable<boolean> {
    const tx = this.db.transaction('layerData', 'readwrite');
    return from(
      Promise.all([
        this.waitForDb(),
        tx.store.delete(layerId),
        tx.done.then(() => true).catch(() => false)
      ])
    ).pipe(switchMap((r) => of(r[2])));
  }

  /**
   * This method retrive all idb layer definition
   * @param
   * @returns
   */
  getAll(): Observable<LayerDBData[]> {
    return from(this.waitForDb().then(() => this.db.getAll('layerData')));
  }
}
