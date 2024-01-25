import { Injectable } from '@angular/core';

import { CompressionService } from '@igo2/core';

import { IDBPDatabase } from 'idb';
import { DBMode, NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, Subject, from, of } from 'rxjs';
import { concatMap, first, map, switchMap, take } from 'rxjs/operators';

import { Igo2DBSchema } from '../shared/db.interface';
import { createDb } from '../shared/db.utils';
import { InsertSourceInsertDBEnum } from './geoDB.enums';
import { GeoDBData } from './geoDB.interface';

@Injectable({
  providedIn: 'root'
})
export class GeoDBService {
  readonly dbName: string = 'geoData';
  db: IDBPDatabase<Igo2DBSchema>;
  public collisionsMap: Map<number, string[]> = new Map();
  public _newData: number = 0;

  constructor(
    private ngxIndexedDBService: NgxIndexedDBService,
    private compression: CompressionService
  ) {
    this.waitForDb().then();
  }

  private async waitForDb() {
    if (!this.db) {
      this.db = await createDb();
    }
    return;
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
    regionID: any,
    object: any,
    insertSource: InsertSourceInsertDBEnum,
    insertEvent: string
  ): Observable<any> {
    if (!object) {
      return;
    }
    let compress = false;

    const subject: Subject<GeoDBData> = new Subject();
    let object$: Observable<any> = of(object);
    if (object instanceof Blob) {
      object$ = this.compression.compressBlob(object);
      compress = true;
    }
    let geoDBData: GeoDBData;
    object$
      .pipe(
        first(),
        concatMap((object) => {
          geoDBData = {
            url,
            regionID,
            object: object,
            compressed: compress,
            insertSource,
            insertEvent
          };
          return this.ngxIndexedDBService.getByID(this.dbName, url);
        }),
        concatMap((dbObject: GeoDBData) => {
          if (!dbObject) {
            this._newData++;
            return this.ngxIndexedDBService.add(this.dbName, geoDBData);
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
      )
      .subscribe((response) => {
        subject.next(response);
        subject.complete();
      });
    return subject;
  }

  private customUpdate(geoDBData: GeoDBData): Observable<GeoDBData> {
    const subject: Subject<GeoDBData> = new Subject();
    const deleteRequest = this.ngxIndexedDBService.deleteByKey(
      this.dbName,
      geoDBData.url
    );
    deleteRequest
      .pipe(
        concatMap((isDeleted) =>
          isDeleted
            ? this.ngxIndexedDBService.add(this.dbName, geoDBData)
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

  get(url: string): Observable<any> {
    return this.ngxIndexedDBService.getByID(this.dbName, url).pipe(
      map((data: GeoDBData) => {
        if (data) {
          const object = data.object;
          if (!data.compressed) {
            return object;
          }
          return this.compression.decompressBlob(object);
        }
      })
    );
  }

  getByID(url: string): Observable<any> {
    return this.ngxIndexedDBService.getByID(this.dbName, url);
  }

  deleteByKey(url: string): Observable<any> {
    return this.ngxIndexedDBService.deleteByKey(this.dbName, url);
  }

  getRegionCountByID(id: number): Observable<number> {
    const subject: Subject<number> = new Subject();
    const dbRequest = this.getRegionByID(id).subscribe((datas) => {
      subject.next(datas.length);
      subject.complete();
    });
    return subject;
  }

  getRegionByID(id: number): Observable<any[]> {
    if (!id) {
      return;
    }

    const IDBKey: IDBKeyRange = IDBKeyRange.only(id);
    const dbRequest = this.ngxIndexedDBService.getAllByIndex(
      this.dbName,
      'regionID',
      IDBKey
    );
    return dbRequest;
  }

  deleteByRegionID(id: number): Observable<boolean> {
    if (!id) {
      return;
    }
    const IDBKey: IDBKeyRange = IDBKeyRange.only(id);
    const dbRequest = from(
      Promise.all([
        this.waitForDb(),
        this.db
          .getAllFromIndex('geoData', 'regionIDIdx', IDBKey)
          .then((geoDatas: GeoDBData[]) => {
            const tx = this.db.transaction('geoData', 'readwrite');
            const promises = geoDatas.map((geoData) =>
              tx.store.delete(geoData.url)
            );
            promises.push(tx.done);
            return Promise.all([promises]);
          })
      ])
    ).pipe(switchMap((r) => of(r[1].every((r) => r))));
    /*.pipe(
      mergeMap((geoDatas: GeoDBData[]) => geoDatas),
      map((geoData: GeoDBData) => {
        const tx = this.db.transaction('geoData', 'readwrite');
        return from(
          Promise.all([
            this.waitForDb(),
            tx.store.delete(geoData.url),
            tx.done.then(() => true).catch(() => false)
          ])
        ).pipe(switchMap((r) => of(r[2])));
      })
    );*/
    return dbRequest;
  }

  openCursor(
    keyRange: IDBKeyRange = IDBKeyRange.lowerBound(0),
    mode: DBMode = DBMode.readonly
  ) {
    const request = this.ngxIndexedDBService.openCursorByIndex(
      this.dbName,
      'regionID',
      keyRange,
      mode
    );
    return request;
  }

  resetCounters() {
    this.resetCollisionsMap();
    this._newData = 0;
  }

  resetCollisionsMap() {
    this.collisionsMap = new Map();
  }

  revertCollisions() {
    for (const [regionID, collisions] of this.collisionsMap) {
      for (const url of collisions) {
        this.ngxIndexedDBService
          .getByKey(this.dbName, url)
          .pipe(take(1))
          .subscribe((dbObject: GeoDBData) => {
            const updatedObject = dbObject;
            updatedObject.regionID = regionID;
            this.customUpdate(dbObject);
          });
      }
    }
  }

  get newData(): number {
    return this._newData;
  }
}
