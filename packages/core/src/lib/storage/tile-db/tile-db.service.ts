import { Injectable } from '@angular/core';
import { DBMode, NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, Subject } from 'rxjs';
import { first, map, take } from 'rxjs/operators';
import { CompressionService } from '../compression/compression.service';
import { TileDBData } from './TileDBData.interface';

@Injectable({
  providedIn: 'root'
})
export class TileDBService {
  readonly dbName: string = 'geoData';
  public collisionsMap: Map<number, string[]> = new Map();
  public _newTiles: number = 0;

  constructor(
    private dbService: NgxIndexedDBService,
    private compression: CompressionService
  ) { }

  update(url: string, regionID: number, object: Blob): Observable<any> {
    if (!object) {
      return;
    }

    const subject: Subject<TileDBData> = new Subject();
    const compress$ = this.compression.compressBlob(object);
    compress$.pipe(first())
      .subscribe((compressedObject) => {
        const tileDBData: TileDBData = {
          url,
          regionID,
          object: compressedObject
        };
        const getRequest = this.dbService.getByID(this.dbName, url);
        getRequest.subscribe((dbObject: TileDBData) => {
          let dbRequest: Observable<TileDBData>;
          if (!dbObject) {
            this._newTiles++;
            dbRequest = this.dbService.addItem(this.dbName, tileDBData);
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
            dbRequest = this.customUpdate(tileDBData);
          }
          dbRequest.subscribe((response) => {
            subject.next(response);
            subject.complete();
          });
        });
      });
    return subject;
  }

  private customUpdate(tileDBData: TileDBData): Observable<TileDBData> {
    const subject: Subject<TileDBData> = new Subject();
    const deleteRequest = this.dbService.deleteByKey(this.dbName, tileDBData.url);
    deleteRequest.subscribe((isDeleted) => {
      if (isDeleted) {
        const addRequest = this.dbService.addItem(this.dbName, tileDBData);
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
    return this.dbService.getByID(this.dbName, url).pipe(
      map((data) => {
        if (data) {
          const object = (data as TileDBData).object;
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
    const dbRequest = this.dbService.getAllByIndex(this.dbName, 'regionID', IDBKey);
    return dbRequest;
  }

  deleteByRegionID(id: number): Observable<any> {
    if (!id) {
      return;
    }

    const IDBKey: IDBKeyRange = IDBKeyRange.only(id);
    const dbRequest = this.dbService.getAllByIndex(this.dbName, 'regionID', IDBKey);
    dbRequest.subscribe((tiles: TileDBData[]) => {
      tiles.forEach((tile) => {
        this.dbService.deleteByKey(this.dbName, tile.url);
      });
    });
    return dbRequest;
  }

  openCursor(
    keyRange: IDBKeyRange = IDBKeyRange.lowerBound(0),
    mode: DBMode = DBMode.readonly
  ) {
    const request = this.dbService.openCursorByIndex(this.dbName, 'regionID', keyRange, mode);
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
    const it = this.collisionsMap.keys();
    for (const [regionID, collisions] of this.collisionsMap) {
      for (const url of collisions) {
        this.dbService.getByKey(this.dbName, url)
          .pipe(take(1))
          .subscribe((dbObject: TileDBData) => {
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
