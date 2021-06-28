import { Injectable } from '@angular/core';
import { DBMode } from 'ngx-indexed-db';
import { Observable, Subscription, zip } from 'rxjs';
import { skip, timestamp } from 'rxjs/operators';
import { DBRegion, GeoDataDBService, RegionDBService } from '../storage';
import { DbData } from '../storage/dbData';
import { TileDownloaderService } from './tile-downloader/tile-downloader.service';
// need to make region db
// need to ajust download method of TileDownloaderService
// need to create regionDBService
// need to create geodata-db delete method
// need to create geodata-db deleteRegion by id or name wtv method

interface TileToDownload {
  url: string;
  coord: [number, number, number];
  templateUrl: string;
  tileGrid;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadRegionService {
  isDownloading$$: Subscription;
  private isUpdating$$: Subscription;
  constructor(
    private tileDownloader: TileDownloaderService,
    private tileDB: GeoDataDBService,
    private regionDB: RegionDBService
  ) {
    this.updateAllRegionTileCount();
  }
  // need on right click method for the controler
  public downloadSelectedRegion(
    tilesToDownload: TileToDownload[],
    regionName: string,
    depth: number
  ) {

    if (this.isDownloading$$) {
      this.isDownloading$$.unsubscribe();
    }
    const parentUrls = tilesToDownload.map((item: TileToDownload) => {
      return item.url;
    });

    const numberOfTiles = this.tileDownloader.numberOfTiles(depth) * tilesToDownload.length;
    this.regionDB.add({name: regionName, parentUrls, numberOfTiles})
      .subscribe((regionID: number) => {
        for (const tile of tilesToDownload) {
          this.tileDownloader.downloadFromCoord(
            tile.coord,
            regionID,
            depth,
            tile.tileGrid,
            tile.templateUrl
          );
        }
        this.isDownloading$$ = this.tileDownloader.isDownloading$
          .pipe(skip(1))
          .subscribe((isDownloading) => {
            if (!isDownloading) {
              const collisionMap = this.tileDB.collisionsMap;
              const validTile = this.tileDownloader.validDownloadCount;
              const date = new Date();
              const regionDb: DBRegion = {
                id: regionID,
                name: regionName,
                parentUrls,
                numberOfTiles: validTile,
                timestamp: date
              }
              this.regionDB.update(regionDb);
              this.regionDB.updateWithCollisions(collisionMap);
              this.tileDB.resetCollisionMap();
          }
        });
      });
  }

  public addToSelectedRegion(parentCoords: [number, number, number]) {
    // const url = generateUrl
    //
  }

  public updateRegion(name: string) {
    // get region in db
  }

  private getRegionsName() {
    // get all regions names in db
  }

  public createRegion(name: string) {
    // this.selectedRegion = new Region

  }

  public deleteRegionByID(regionID: number): Observable<[boolean, boolean]> {
    if (!regionID) {
      return;
    }

    const regionDBRequest = this.regionDB.deleteByRegionID(regionID);
    const tileDBRequest = this.tileDB.deleteByRegionID(regionID);
    return zip(regionDBRequest, tileDBRequest);
  }

  public updateRegionTileCount(region: DBRegion) {
    if (!region) {
      return;
    }

    this.tileDB.getRegionTileCountByID(region.id).subscribe((count: number) => {
      this.regionDB.update({
        id: region.id,
        name: region.name,
        parentUrls: region.parentUrls,
        numberOfTiles: count,
        timestamp: region.timestamp
      });
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
        const region: DBRegion = (<any>cursor).value;
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

  public updateAllRegionTileCount() {
    if (this.isUpdating$$) {
      this.isUpdating$$.unsubscribe();
    }
    
    const tileCountPerRegion: Map<number, number> = new Map();
    this.isUpdating$$ = this.tileDB.openCursor().subscribe((event) => {
      if (!event) {
        return;
      }
      
      const cursor = (event.target as IDBOpenDBRequest).result;
      if(cursor) {
        const value: DbData = (<any>cursor).value;
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

  public getDownloadSpaceEstimate(nTiles: number): number {
    return this.tileDownloader.downloadEstimate(nTiles);
  }
}
