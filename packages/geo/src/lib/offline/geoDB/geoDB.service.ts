import { Injectable } from '@angular/core';
import { DBMode, NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, Subject } from 'rxjs';
import { first, map, take } from 'rxjs/operators';
import { CompressionService } from '@igo2/core';
import { GeoDBData } from './geoDB.interface';

@Injectable({
  providedIn: 'root'
})
export class GeoDBService {
  readonly dbName: string = 'geoData';
  public collisionsMap: Map<number, string[]> = new Map();
  public _newTiles: number = 0;

  constructor(
    private ngxIndexedDBService: NgxIndexedDBService,
    private compression: CompressionService
  ) { }

  update(url: string, regionID: number, object: Blob): Observable<any> {
    if (!object) {
      return;
    }

    const subject: Subject<GeoDBData> = new Subject();
    const compress$ = this.compression.compressBlob(object);
    compress$.pipe(first())
      .subscribe((compressedObject) => {
        const GeoDBData: GeoDBData = {
          url,
          regionID,
          object: compressedObject
        };
        const getRequest = this.ngxIndexedDBService.getByID(this.dbName, url);
        getRequest.subscribe((dbObject: GeoDBData) => {
          let dbRequest: Observable<GeoDBData>;
          if (!dbObject) {
            this._newTiles++;
            dbRequest = this.ngxIndexedDBService.add(this.dbName, GeoDBData);
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
            dbRequest = this.customUpdate(GeoDBData);
          }
          dbRequest.subscribe((response) => {
            subject.next(response);
            subject.complete();
          });
        });
      });
    return subject;
  }

  private customUpdate(GeoDBData: GeoDBData): Observable<GeoDBData> {
    const subject: Subject<GeoDBData> = new Subject();
    const deleteRequest = this.ngxIndexedDBService.deleteByKey(this.dbName, GeoDBData.url);
    deleteRequest.subscribe((isDeleted) => {
      if (isDeleted) {
        const addRequest = this.ngxIndexedDBService.add(this.dbName, GeoDBData);
        addRequest.subscribe((object) => {
          subject.next(object);
          subject.complete();
        });
      } else {
        subject.complete();
      }
    });
    return subject;
  }

  get(url: string): Observable<Blob> {
    return this.ngxIndexedDBService.getByID(this.dbName, url).pipe(
      map((data) => {
        if (data) {
          const object = (data as GeoDBData).object;
          if (object instanceof Blob) {
            return object;
          }
          return this.compression.decompressBlob(object);
        }
      })
    );
  }

  getRegionTileCountByID(id: number): Observable<number> {
    const subject: Subject<number> = new Subject();
    const dbRequest = this.getRegionByID(id)
      .subscribe((tiles) => {
        subject.next(tiles.length);
        subject.complete();
      });
    return subject;
  }

  getRegionByID(id: number): Observable<any[]> {
    if (!id) {
      return;
    }

    const IDBKey: IDBKeyRange = IDBKeyRange.only(id);
    const dbRequest = this.ngxIndexedDBService.getAllByIndex(this.dbName, 'regionID', IDBKey);
    return dbRequest;
  }

  deleteByRegionID(id: number): Observable<any> {
    if (!id) {
      return;
    }

    const IDBKey: IDBKeyRange = IDBKeyRange.only(id);
    const dbRequest = this.ngxIndexedDBService.getAllByIndex(this.dbName, 'regionID', IDBKey);
    dbRequest.subscribe((tiles: GeoDBData[]) => {
      tiles.forEach((tile) => {
        this.ngxIndexedDBService.deleteByKey(this.dbName, tile.url);
      });
    });
    return dbRequest;
  }

  openCursor(
    keyRange: IDBKeyRange = IDBKeyRange.lowerBound(0),
    mode: DBMode = DBMode.readonly
  ) {
    const request = this.ngxIndexedDBService.openCursorByIndex(this.dbName, 'regionID', keyRange, mode);
    return request;
  }

  resetCounters() {
    this.resetCollisionsMap();
    this._newTiles = 0;
  }

  resetCollisionsMap() {
    this.collisionsMap = new Map();
  }

  revertCollisions() {
    for (const [regionID, collisions] of this.collisionsMap) {
      for (const url of collisions) {
        this.ngxIndexedDBService.getByKey(this.dbName, url)
          .pipe(take(1))
          .subscribe((dbObject: GeoDBData) => {
            const updatedObject = dbObject;
            updatedObject.regionID = regionID;
            this.customUpdate(dbObject);
          });
      }
    }
  }

  get newTiles(): number {
    return this._newTiles;
  }
}
