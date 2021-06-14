import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { CompressionService } from './compression.service';
import { DbData } from './dbData';

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
}
