import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { MessageService } from '@igo2/core/message';
import { CompressedData, Compression } from '@igo2/utils';

import { IDBPDatabase, openDB } from 'idb';
import JSZip from 'jszip';
import { ActiveToast } from 'ngx-toastr';
import {
  Observable,
  Subscription,
  catchError,
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

import { InsertSourceInsertDBEnum } from './geoDB.enums';
import { DatasToIDB, GeoDBData, GeoDataDBSchema } from './geoDB.interface';

@Injectable()
export class GeoDBService {
  private databaseName = 'geodata-db';
  private databaseVersion = 1;

  private db$: Observable<IDBPDatabase<GeoDataDBSchema>>;
  private compression = new Compression();
  public collisionsMap = new Map<number | string, string[]>();
  public _newData = 0;
  private revertObservablesSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.db$ = this.createGeoDataDb();
  }

  private createGeoDataDb(): Observable<IDBPDatabase<GeoDataDBSchema>> {
    return from(
      openDB<GeoDataDBSchema>(this.databaseName, this.databaseVersion, {
        upgrade(db) {
          const geoDataStore = db.createObjectStore('geoData', {
            keyPath: 'url',
            autoIncrement: false
          });
          geoDataStore.createIndex('regionID-idx', 'regionID', {
            unique: false
          });
        }
      })
    );
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

  load(urlFile: string) {
    let downloadMessage: ActiveToast<any>;
    this.http
      .get(urlFile)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.messageService.error(
            `GeoData file ${urlFile} could not be read`
          );
          error.error.caught = true;
          throw error;
        }),
        concatMap((datasToIDB: DatasToIDB) => {
          const datas$ = [];
          let firstDownload = true;
          if (datasToIDB?.geoDatas) {
            const currentDate = new Date();
            datasToIDB?.geoDatas.forEach((geoData) => {
              if (typeof geoData.triggerDate === 'string') {
                geoData.triggerDate = new Date(Date.parse(geoData.triggerDate));
              }
              if (currentDate >= geoData.triggerDate) {
                if (geoData.action === 'update') {
                  const insertEvent = `${
                    geoData.source || InsertSourceInsertDBEnum.System
                  } (${geoData.triggerDate})`;
                  geoData.urls.forEach((url) => {
                    datas$.push(
                      this.getGeoDBData(url).pipe(
                        concatMap((res: GeoDBData) => {
                          if (res?.insertEvent !== insertEvent) {
                            if (firstDownload) {
                              downloadMessage = this.messageService.info(
                                'igo.geo.indexedDb.data-download-start',
                                undefined,
                                {
                                  disableTimeOut: true,
                                  progressBar: false,
                                  closeButton: true,
                                  tapToDismiss: false
                                }
                              );
                              firstDownload = false;
                            }
                            let responseType: any = 'json';
                            const isZip = this.isZip(url);
                            if (isZip) {
                              responseType = 'arraybuffer';
                            }
                            return this.http.get(url, { responseType }).pipe(
                              catchError((error: HttpErrorResponse) => {
                                this.messageService.remove(
                                  downloadMessage.toastId
                                );
                                this.messageService.error(
                                  'igo.geo.indexedDb.data-download-failed',
                                  undefined,
                                  { timeOut: 40000 }
                                );

                                error.error.caught = true;
                                throw error;
                              }),
                              concatMap((r) => {
                                if (isZip) {
                                  const observables$ = [
                                    this.update(
                                      url,
                                      url,
                                      {},
                                      InsertSourceInsertDBEnum.System,
                                      insertEvent
                                    )
                                  ];
                                  JSZip.loadAsync(r).then((zipped) => {
                                    zipped.forEach((relativePath) => {
                                      if (
                                        relativePath
                                          .toLocaleLowerCase()
                                          .endsWith('.geojson')
                                      ) {
                                        zipped
                                          .file(relativePath)
                                          .async('text')
                                          .then((r) => {
                                            const geojson = JSON.parse(r);
                                            const subUrl =
                                              geoData.zippedBaseUrl || '';
                                            const zippedUrl =
                                              subUrl +
                                              (subUrl.endsWith('/')
                                                ? ''
                                                : '/') +
                                              relativePath;
                                            observables$.push(
                                              this.update(
                                                zippedUrl,
                                                url,
                                                geojson,
                                                InsertSourceInsertDBEnum.System,
                                                insertEvent
                                              )
                                            );
                                          });
                                      }
                                    });
                                  });
                                  return zip(observables$);
                                }
                                return this.update(
                                  url,
                                  url,
                                  r,
                                  InsertSourceInsertDBEnum.System,
                                  insertEvent
                                );
                              })
                            );
                          } else {
                            return of(false);
                          }
                        })
                      )
                    );
                  });
                } else if (geoData.action === 'delete') {
                  geoData.urls.forEach((url) => {
                    datas$.push(this.delete(url));
                  });
                }
              }
            });
          }
          return zip(...datas$);
        })
      )
      .subscribe(() => {
        if (downloadMessage) {
          setTimeout(() => {
            this.messageService.remove(downloadMessage.toastId);
            this.messageService.success(
              'igo.geo.indexedDb.data-download-completed',
              undefined,
              { timeOut: 40000 }
            );
          }, 2500);
        }
      });
  }

  private isZip(value) {
    const regex = /(zip)$/;
    return typeof value === 'string' && regex.test(value.toLowerCase());
  }
}
