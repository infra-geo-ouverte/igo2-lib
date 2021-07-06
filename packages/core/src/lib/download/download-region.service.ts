import { Injectable } from '@angular/core';
import { Observable, Subscription, zip } from 'rxjs';
import { skip } from 'rxjs/operators';
import { RegionDBData, TileDBService, RegionDBService, RegionStatus, Region } from '../storage';
import { RegionDBAdminService } from '../storage/region-db/region-db-admin.service';
import { TileDownloaderService } from './tile-downloader/tile-downloader.service';
import { TileGenerationParams } from './tile-downloader/tile-generation-strategies/tile-generation-params.interface';

export interface TileToDownload {
  url: string;
  coord: [ number, number, number ];
  featureText: string;
  templateUrl: string;
  tileGrid;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadRegionService {
  isDownloading$$: Subscription;

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
    // TODO: NEED CHANGE
    // need to change after implementing generation strategy ***
    const z = tilesToDownload[0].coord[0];

    const generationParams: TileGenerationParams = {
      startLevel: z,
      endLevel: z + depth,
      genMethod: this.tileDownloader.strategy
    }

    // need to change after implementing generation strategy ***
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
              const regionDBData: RegionDBData = {
                id: regionID,
                status: RegionStatus.OK,
                name: regionName,
                parentUrls,
                parentFeatureText,
                numberOfTiles: validTile,
                timestamp: date,
                generationParams
              }
              this.regionDB.update(regionDBData);
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
