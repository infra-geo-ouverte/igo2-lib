import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, pipe, Subject } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { CompressionService } from './compression.service';
import { DbData } from './dbData';
import { DBRegion } from './region-db.service';

@Injectable({
  providedIn: 'root'
})
export class GeoDataDBService {
  readonly dbName: string = 'geoData';
  constructor(
    private dbService: NgxIndexedDBService,
    private compression: CompressionService
  ) { }
  
  update(url: string, regionID: number, object: Blob): Observable<any> {
    if (!object) {
      return;
    }

    const subject: Subject<DbData> = new Subject();
    const compress$ = this.compression.compressBlob(object);
    compress$.pipe(first())
      .subscribe((compressedObject) => {
        const dbData: DbData = {
          url,
          regionID,
          object: compressedObject
        };
        const getRequest = this.dbService.getByID(this.dbName, url);
        getRequest.subscribe((object) => {
          let dbRequest: Observable<DbData>;
          if (!object) {
            dbRequest = this.dbService.addItem(this.dbName, dbData)
          } else {
            dbRequest = this.customUpdate(dbData);
          }
          dbRequest.subscribe((object) => {
            subject.next(object);
            subject.complete();
          });
        })
      });
    return subject;
  }

  private customUpdate(dbData: DbData): Observable<DbData> {
    const subject: Subject<DbData> = new Subject();
    const deleteRequest = this.dbService.deleteByKey(this.dbName, dbData.url);
    deleteRequest.subscribe((isDeleted) => {
      if (isDeleted) {
        const addRequest = this.dbService.addItem(this.dbName, dbData);
        addRequest.subscribe((object) => {
          subject.next(object);
          subject.complete();
        });
      } else {
        subject.complete()
      }
    });
    return subject;
  }

  get(url: string): Observable<Blob> {
    return this.dbService.getByID(this.dbName, url).pipe(
      map((data) => {
        if (data) {
          const object = (data as DbData).object;
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

  getRegionByID(id: number): Observable<any> {
    if (!id) {
      return;
    }
    
    const IDBKey: IDBKeyRange = IDBKeyRange.only(id);
    const dbRequest = this.dbService.getAllByIndex(this.dbName, 'regionID', IDBKey);
    return dbRequest;
  }

  deleteByRegionID(id: number): Observable<any> { //to change
    if (!id) {
      return;
    }

    const IDBKey: IDBKeyRange = IDBKeyRange.only(id);
    const dbRequest = this.dbService.getAllByIndex(this.dbName, 'regionID', IDBKey);
    dbRequest.subscribe((tiles: DbData[]) => {
      tiles.forEach((tile) => {
        console.log(tile);
        this.dbService.deleteByKey(this.dbName, tile.url);
      });
    })
    return dbRequest;
  }
}
