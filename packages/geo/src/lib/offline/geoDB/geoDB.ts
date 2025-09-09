import { CompressedData, Compression } from '@igo2/utils';

import { IDBPDatabase } from 'idb';
import {
  Observable,
  Subscription,
  concatMap,
  first,
  from,
  map,
  mergeMap,
  of,
  skipWhile,
  switchMap,
  zip
} from 'rxjs';

import { IgoDBSchema } from '../shared/indexed-db.interface';
import { createIndexedDb } from '../shared/indexed-db.utils';
import { InsertSourceInsertDBEnum } from './geoDB.enums';
import { GeoDBData } from './geoDB.interface';

export class GeoDB {
  private db$: Observable<IDBPDatabase<IgoDBSchema>>;
  private compression = new Compression();
  public collisionsMap = new Map<number | string, string[]>();
  public _newData = 0;
  private revertObservablesSubscription: Subscription;

  constructor() {
    this.db$ = createIndexedDb();
  }

  /**
   * Only blob can be compressed
   * @param url
   * @param regionID
   * @param object object to handle
   * @param insertSource type of event user or system
   * @param insertEvent Name of the event where the insert has been triggered
   * @returns
   */
  update(
    url: string,
    regionID: number | string,
    object: object | Blob,
    insertSource: InsertSourceInsertDBEnum,
    insertEvent: string
  ): Observable<GeoDBData> {
    const object$ =
      object instanceof Blob
        ? this.compression.compressBlob(object)
        : of(object);
    const compress = object instanceof Blob ? true : false;

    let geoDBData: GeoDBData;
    const a = this.db$.pipe(
      switchMap((db) => {
        return object$.pipe(
          first(),
          switchMap((object) => {
            geoDBData = {
              url,
              regionID,
              object: object,
              compressed: compress,
              insertSource,
              insertEvent
            } satisfies GeoDBData;
            return this.getGeoDBData(url);
          }),
          concatMap((dbObject: GeoDBData) => {
            if (!dbObject) {
              this._newData++;
              return from(db.add('geoData', geoDBData)).pipe(
                map(() => geoDBData)
              );
            } else {
              const currentRegionID = dbObject.regionID;
              if (currentRegionID !== regionID) {
                const collisions = this.collisionsMap.get(currentRegionID);
                if (collisions !== undefined) {
                  collisions.push(dbObject.url);
                  this.collisionsMap.set(currentRegionID, collisions);
                } else {
                  this.collisionsMap.set(currentRegionID, [dbObject.url]);
                }
              }
              return this.customUpdate(geoDBData);
            }
          })
        );
      })
    );
    return a;
  }

  private customUpdate(geoDBData: GeoDBData): Observable<GeoDBData> {
    const b = this.delete(geoDBData.url).pipe(
      mergeMap(() => this.add(geoDBData))
    );
    return b;
  }

  add(geoDBData: GeoDBData): Observable<GeoDBData> {
    return this.db$.pipe(
      switchMap((db) =>
        from(db?.add('geoData', geoDBData)).pipe(map(() => geoDBData))
      )
    );
  }

  put(geoDBData: GeoDBData): Observable<GeoDBData> {
    return this.db$.pipe(
      switchMap((db) =>
        from(db?.put('geoData', geoDBData)).pipe(map(() => geoDBData))
      )
    );
  }

  getGeoDBData(url: string): Observable<GeoDBData> {
    return this.db$.pipe(switchMap((db) => from(db?.get('geoData', url))));
  }

  get(url: string): Observable<object | Blob> {
    return this.getGeoDBData(url).pipe(
      skipWhile((data) => !data),
      mergeMap((data) => {
        const rObj = !data.compressed
          ? data?.object
          : this.compression.decompressBlob(data?.object as CompressedData);
        return of(rObj as object | Blob);
      })
    );
  }

  delete(key: string): Observable<object> {
    return this.db$.pipe(
      switchMap((db) => from(db?.delete('geoData', key))),
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

  getRegionCountByID(id: number): Observable<number> {
    return this.getRegionByID(id).pipe(
      switchMap((datas) => {
        return of(datas.length);
      })
    );
  }

  getRegionByID(id: number): Observable<GeoDBData[]> {
    if (!id) {
      return;
    }
    const IDBKey: IDBKeyRange = IDBKeyRange.only(id);
    return this.db$.pipe(
      switchMap((db) =>
        from(db?.getAllFromIndex('geoData', 'regionID-idx', IDBKey))
      )
    );
  }

  deleteByRegionID(id: number): Observable<void[]> {
    if (!id) {
      return;
    }
    return this.db$.pipe(
      switchMap((db) => {
        const tx = db.transaction('geoData', 'readwrite');
        return of(tx);
      }),
      mergeMap((tx) =>
        this.getRegionByID(id).pipe(
          concatMap((datas) => {
            const promises = datas.map((data) => tx.store.delete(data.url));
            promises.push(tx.done);
            return from(Promise.all(promises));
          })
        )
      )
    );
  }

  resetCounters() {
    this.resetCollisionsMap();
    this._newData = 0;
  }

  resetCollisionsMap() {
    this.collisionsMap = new Map();
  }

  revertCollisions(): void {
    if (this.revertObservablesSubscription) {
      this.revertObservablesSubscription.unsubscribe();
    }
    const revertObservables: Observable<GeoDBData>[] = [];
    for (const [regionID, collisions] of this.collisionsMap) {
      for (const url of collisions) {
        revertObservables.push(
          this.getGeoDBData(url).pipe(
            first(),
            concatMap((dbObject: GeoDBData) => {
              const updatedObject = dbObject;
              updatedObject.regionID = regionID;
              return this.customUpdate(updatedObject);
            })
          )
        );
      }
    }
    this.revertObservablesSubscription = zip(...revertObservables).subscribe();
  }

  get newData(): number {
    return this._newData;
  }
}
