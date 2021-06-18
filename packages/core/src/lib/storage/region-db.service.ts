import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, Subject } from 'rxjs';

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
  readonly update$: Subject<boolean> = new Subject();
  constructor(private dbService: NgxIndexedDBService) { }

  update(region: DBRegion): Observable<DBRegion[]> {
    if (!region) {
      return;
    }

    const dbRequest = this.dbService.update(this.dbName, region);
    dbRequest.subscribe(() => {
      this.update$.next(true);
    });
  }

  add(region: Region): Observable<number> {
    if (!region) {
      return;
    }

    const dbRequest = this.dbService.add(this.dbName, region);
    dbRequest.subscribe((key) => {
      this.update$.next(true);
    });
    return dbRequest;
  }

  getAll(): Observable<DBRegion[]> {
    return this.dbService.getAll(this.dbName);
  }

  deleteByRegionID(regionID: number): Observable<boolean> {
    if (!regionID) {
      return;
    }

    const dbRequest = this.dbService.deleteByKey(this.dbName, regionID);
    dbRequest.subscribe(() => {
      this.update$.next(true);
    });
    return dbRequest;
  }
}
