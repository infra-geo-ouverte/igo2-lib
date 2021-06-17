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

  update(url: string, regionID: number, object): Observable<any> {
    if (!object) {
      return;
    }

    if (object instanceof Blob) {
      const compressObs = this.compression.compressBlob(object);
      compressObs.pipe(first())
        .subscribe((compressedObject) => {
          const dbData: DbData = {
            url,
            regionID,
            object: compressedObject
          };
          this.dbService.update(this.dbName, dbData);
        });
    }
    const dbRequest = this.dbService.update(this.dbName, {url, object});

    dbRequest.pipe(first())
      .subscribe(() => console.log('db updated'));

    return dbRequest;
  }

  get(url: string): Observable<Blob> {
    return this.dbService.getByID(this.dbName, url).pipe(
      map((data) => {
        console.log('database get:', url);
        if (data) {
          const object = (data as DbData).object;
          if (object instanceof Blob) {
            return object;
          }
          return this.compression.decompressBlob(object);
        }
        console.log('not in db');
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
