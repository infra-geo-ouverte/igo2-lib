import { Injectable } from '@angular/core';
import { DBMode } from 'ngx-indexed-db';
import { Observable, Subscription, zip } from 'rxjs';
import { skip, timestamp } from 'rxjs/operators';
import { RegionTileDBData, TileDBService, RegionDBService, RegionStatus, Region } from '../storage';
import { RegionDBAdminService } from '../storage/region-db/region-db-admin.service';
import { TileDBData } from '../storage/tile-db/TileDBData.interface';
import { TileDownloaderService } from './tile-downloader/tile-downloader.service';
// need to make region db
// need to ajust download method of TileDownloaderService
// need to create regionDBService
// need to create geodata-db delete method
// need to create geodata-db deleteRegion by id or name wtv method

export interface TileToDownload {
  url: string;
  coord: [number, number, number];
  featureText: string;
  templateUrl: string;
  tileGrid;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadRegionService {
  isDownloading$$: Subscription;
  //private isUpdating$$: Subscription;
  constructor(
    private tileDownloader: TileDownloaderService,
    private tileDB: TileDBService,
    private regionDB: RegionDBService,
    private regionDBAdmin: RegionDBAdminService
  ) {
    this.regionDBAdmin.updateAllRegionTileCount();
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

    const parentFeatureText = tilesToDownload.map((item: TileToDownload) => {
      return item.featureText;
    })

    const numberOfTiles = this.tileDownloader.numberOfTiles(depth) * tilesToDownload.length;
    const region: Region = {
      name: regionName,
      status: RegionStatus.Downloading,
      parentUrls,
      numberOfTiles,
      parentFeatureText
    };

    this.regionDB.add(region)
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
              const regionDb: RegionTileDBData = {
                id: regionID,
                status: RegionStatus.OK,
                name: regionName,
                parentUrls,
                parentFeatureText,
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

  public deleteRegionByID(regionID: number): Observable<[boolean, boolean]> {
    if (!regionID) {
      return;
    }

    const regionDBRequest = this.regionDB.deleteByRegionID(regionID);
    const tileDBRequest = this.tileDB.deleteByRegionID(regionID);
    return zip(regionDBRequest, tileDBRequest);
  }

  public getDownloadSpaceEstimate(nTiles: number): number {
    return this.tileDownloader.downloadEstimate(nTiles);
  }
}
