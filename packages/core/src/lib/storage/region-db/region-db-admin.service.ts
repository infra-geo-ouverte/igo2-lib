import { Injectable } from '@angular/core';
import { DBMode } from 'ngx-indexed-db';
import { interval } from 'rxjs';
import { TileDBData, TileDBService } from '../tile-db';
import { RegionDBService } from './region-db.service';
import { RegionStatus, RegionTileDBData } from './Region.interface';


@Injectable({
  providedIn: 'root'
})
export class RegionDBAdminService {
  private static readonly ONE_HOUR = 1000 * 60 * 60;
  private static readonly ONE_DAY = 24 * RegionDBAdminService.ONE_HOUR;
  private readonly expirationInterval = 30 * RegionDBAdminService.ONE_DAY;
  //private readonly expirationInterval = 60 * 1000;

  constructor(
    private regionDB: RegionDBService,
    private tileDB: TileDBService
  ) {
    // this.checkExpirations$$ = interval(1000)
    interval(RegionDBAdminService.ONE_HOUR).subscribe(() => {
        // console.log("check expiration")
        this.checkExpirations();
      });
  }

  updateStatus(region: RegionTileDBData, newStatus: RegionStatus) {
    const updatedRegion: RegionTileDBData = region;
    updatedRegion.status = newStatus;
    this.regionDB.update(updatedRegion);
  }

  public updateAllRegionTileCount() {
    const tileCountPerRegion: Map<number, number> = new Map();
    this.tileDB.openCursor().subscribe((event) => {
      if (!event) {
        return;
      }
      
      const cursor = (event.target as IDBOpenDBRequest).result;
      if(cursor) {
        const value: TileDBData = (<any>cursor).value;
        const regionID = value.regionID
        let tileCount = tileCountPerRegion.get(regionID);
        if (tileCount) {
          tileCountPerRegion.set(regionID, ++tileCount);
        } else {
          tileCountPerRegion.set(regionID, 1);
        }
        (<any>cursor).continue();
      } else {
        this.updateRegionTileCountWithMap(tileCountPerRegion);
      }
    });
  }

  private updateRegionTileCountWithMap(tileCountPerRegion: Map<number, number>) {
    if (!tileCountPerRegion) {
      return;
    }

    this.regionDB.openCursor(undefined, DBMode.readwrite).subscribe((event) => {
      if (!event) {
        return;
      }

      const cursor = (event.target as IDBOpenDBRequest).result;
      if (cursor) {
        const region: RegionTileDBData = (<any>cursor).value;
        const tileCount = tileCountPerRegion.get(region.id);
        if (tileCount !== undefined) {
          region.numberOfTiles = tileCount;
        } else {
          region.numberOfTiles = 0;
        }
        (<any>cursor).update(region);
        (<any>cursor).continue();
      } else {
        this.regionDB.needUpdate();
      }
    });
  }

  checkExpirations() {
    let needUpdate = false;
    this.regionDB.openCursor(undefined, DBMode.readwrite).subscribe((event) => {
      if (!event) {
        return;
      }
      const cursor = (event.target as IDBOpenDBRequest).result;
      if (!cursor) {
        if (needUpdate) {
          this.regionDB.needUpdate()
        }
        return;
      }
      const region: RegionTileDBData = (<any>cursor).value;
      if (region.status === RegionStatus.Downloading) {
        return;
      }
      
      const downloadDate: Date = region.timestamp;
      const currentDate = new Date();
      if (currentDate.getTime() - downloadDate.getTime() >= this.expirationInterval) {
        if (region.status !== RegionStatus.Expired) {
          region.status = RegionStatus.Expired;
          (<any>cursor).update(region);
          needUpdate = true;
        }
      }
      (<any>cursor).continue();
    });
  }

  public updateRegionTileCount(region: RegionTileDBData) {
    if (!region) {
      return;
    }

    this.tileDB.getRegionTileCountByID(region.id).subscribe((count: number) => {
      const newRegion = region;
      newRegion.numberOfTiles = count;
      this.regionDB.update(newRegion);
    });
  }
}
