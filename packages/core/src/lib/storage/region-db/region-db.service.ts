import { Injectable } from '@angular/core';
import { DBMode, NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, Subject } from 'rxjs';
import { Region, RegionDate, RegionDBData } from './Region.interface';

function createRegionDateFromRegion(region: Region): RegionDate {
  const regionDate: RegionDate = region as RegionDate;
  regionDate.timestamp = new Date();
  return regionDate;
}

function createRegionDBDataFromRegionDate(
  regionDate: RegionDate,
  id: number)
: RegionDBData {
  const regionDBData = regionDate as RegionDBData;
  regionDBData.id = id;
  return regionDBData;
}

@Injectable({
  providedIn: 'root'
})
export class RegionDBService {
  readonly dbName: string = 'regionData';
  readonly update$: Subject<boolean> = new Subject();
  constructor(private dbService: NgxIndexedDBService) { }

  update(region: RegionDBData): Observable<RegionDBData[]> {
    if (!region) {
      return;
    }
    region.timestamp = new Date();
    const dbRequest = this.dbService.update(this.dbName, region);
    dbRequest.subscribe(() => {
      this.update$.next(true);
    });
    return dbRequest;
  }

  add(region: Region): Observable<RegionDBData> {
    if (!region) {
      return;
    }
    const regionDate: RegionDate = createRegionDateFromRegion(region);
    const dbRequest = this.dbService.add(this.dbName, regionDate);
    const regionDBData$: Subject<RegionDBData> = new Subject();
    dbRequest.subscribe((regionID) => {
      const regionDBData = createRegionDBDataFromRegionDate(
        regionDate,
        regionID
      );
      regionDBData$.next(regionDBData);
      regionDBData$.complete();
      this.update$.next(true);
    });
    return regionDBData$;
  }

  getByID(id: number): Observable<RegionDBData> {
    return this.dbService.getByKey(this.dbName, id);
  }

  getAll(): Observable<RegionDBData[]> {
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

  openCursor(
    keyRange: IDBKeyRange = IDBKeyRange.lowerBound(0),
    mode: DBMode = DBMode.readonly
  ) {
    // need to update when openCursor method is fixed in ngx-indexed-db package
    const request = this.dbService.openCursorByIndex(this.dbName, 'name', keyRange, mode);
    return request;
  }

  updateWithCollisions(collisionsMap: Map<number, string[]>) {
    const it = collisionsMap.keys();
    let regionID = it.next().value;
    while (regionID !== undefined) {
      const collisions = collisionsMap.get(regionID);
      this.dbService.getByID(this.dbName, regionID).subscribe(
        (region: RegionDBData) => {
          region.numberOfTiles -= collisions.length;
          if (region.numberOfTiles === 0) {
            this.deleteByRegionID(region.id);
          } else {
            this.updateWithNoTimestamp(region);
          }
        }
      );
      regionID = it.next().value;
    }
  }

  needUpdate() {
    this.update$.next(true);
  }

  private updateWithNoTimestamp(region: RegionDBData): Observable<RegionDBData[]> {
    if (!region) {
      return;
    }
    const dbRequest = this.dbService.update(this.dbName, region);
    dbRequest.subscribe(() => {
      this.update$.next(true);
    });
  }
}
