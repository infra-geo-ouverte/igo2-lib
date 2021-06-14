import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';

export interface Region {
  name: string;
  parentUrls: string[];
  numberOfTiles: number;
}

export interface DBRegion {
  id: number;
  name: string;
  parentUrls: string[];
  numberOfTiles: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegionDBService {
  readonly dbName: string = 'regionData';
  constructor(private dbService: NgxIndexedDBService) { }

  update(region: DBRegion): Observable<DBRegion[]> {
    if (!region) {
      return;
    }

    const dbRequest = this.dbService.update(this.dbName, region);
    dbRequest.subscribe(() => {
      console.log("Region db item updated");
    });
  }

  add(region: Region): Observable<number> {
    if (!region) {
      return;
    }

    const dbRequest = this.dbService.add(this.dbName, region);
    dbRequest.subscribe((key) => {
      console.log('Region db added key: ', key);
    });
    return dbRequest;
  }

  getAll(): Observable<DBRegion[]> {
    return this.dbService.getAll(this.dbName);
  }

  delete(id: number): Observable<boolean> {
    if (!id) {
      return;
    }

    const dbRequest = this.dbService.deleteByKey(this.dbName, id);
    return dbRequest;
  }
}
