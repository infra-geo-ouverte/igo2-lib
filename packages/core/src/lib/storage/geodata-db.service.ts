import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { DbData } from './dbData';

@Injectable({
  providedIn: 'root'
})
export class GeoDataDBService {
  readonly dbName: string = 'geoData';
  constructor(
    private dbService: NgxIndexedDBService
  ) { }

  update(url: string, object) {
    this.dbService.update(this.dbName, {url: url, object: object})
      .pipe(first())
      .subscribe(() => console.log("db updated"));
  }

  get(url: string): Observable<Blob> {
    return this.dbService.getByID(this.dbName, url).pipe(
      map((data) => {
        console.log("database get:", url);
        if (data) {
          return (data as DbData).object;
        }
        console.log("not in db")
      })
    );
  }
}
