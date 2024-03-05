import { Injectable } from '@angular/core';

import { CompressionService } from '@igo2/core';

import { DBMode, NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { concatMap, first, map } from 'rxjs/operators';

import { InsertSourceInsertDBEnum } from './geoDB.enums';
import { GeoDBData } from './geoDB.interface';

@Injectable({
  providedIn: 'root'
})
export class GeoDBService {
  readonly dbName: string = 'geoData';

  constructor(
    private ngxIndexedDBService: NgxIndexedDBService,
    private compression: CompressionService
  ) {}

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
            regionIDs: [regionID],
            object: object,
            compressed: compress,
            insertSource,
            insertEvent
          };
          return this.ngxIndexedDBService.getByID(this.dbName, url);
        }),
        concatMap((dbObject: GeoDBData) => {
          if (!dbObject) {
            return this.ngxIndexedDBService.add(this.dbName, geoDBData);
          }

          if (dbObject.regionIDs.includes(regionID)) {
            console.log('region already there');
            return of(dbObject);
          }

          dbObject.regionIDs.push(regionID);
          return this.customUpdate(dbObject);
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

  getRegionCountByID(id: string): Observable<number> {
    const subject: Subject<number> = new Subject();
    const dbRequest = this.getRegionByID(id).subscribe((datas) => {
      subject.next(datas.length);
      subject.complete();
    });
    return subject;
  }

  getRegionByID(id: string): Observable<any[]> {
    if (!id) {
      return;
    }

    const IDBKey: IDBKeyRange = IDBKeyRange.only(id);
    const dbRequest = this.ngxIndexedDBService.getAllByIndex(
      this.dbName,
      'regionIDs',
      IDBKey
    );
    return dbRequest;
  }

  deleteByRegionID(id: string): Observable<any> {
    if (!id) {
      return;
    }

    const done$ = new Subject<void>();
    const IDBKey: IDBKeyRange = IDBKeyRange.only(id);
    const dbRequest = this.ngxIndexedDBService.getAllByIndex(
      this.dbName,
      'regionIDs',
      IDBKey
    );
    dbRequest.subscribe((results: GeoDBData[]) => {
      if (!results.length) {
        done$.next();
        done$.complete();
        return;
      }

      forkJoin(
        results.map((data) => {
          const { regionIDs } = data;
          if (regionIDs.length === 1) {
            return this.ngxIndexedDBService.deleteByKey(this.dbName, data.url);
          }

          // Remove region
          const index = regionIDs.findIndex((regionID) => regionID === id);
          regionIDs[index] = regionIDs[regionIDs.length - 1];
          regionIDs.pop();

          return this.customUpdate(data);
        })
      ).subscribe(() => {
        done$.next();
        done$.complete();
      });
    });
    return done$;
  }

  openCursor(
    keyRange: IDBKeyRange = IDBKeyRange.lowerBound(0),
    mode: DBMode = DBMode.readonly
  ) {
    const request = this.ngxIndexedDBService.openCursorByIndex(
      this.dbName,
      'regionIDs',
      keyRange,
      mode
    );
    return request;
  }
}
