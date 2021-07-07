import { Injectable } from '@angular/core';
import { Observable, Subscription, zip } from 'rxjs';
import { map, skip } from 'rxjs/operators';
import { RegionDBData, TileDBService, RegionDBService, RegionStatus, Region, TileDBData } from '../storage';
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

export interface RegionUpdateParams {
  name: string;
  newTiles: TileToDownload[];
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

  private updateRegionDBData(
    oldRegion: RegionDBData, 
    updateParams: RegionUpdateParams
  ): RegionDBData {
    const region: RegionDBData = oldRegion;
    region.name = updateParams.name;
    
    const tileToDownload = updateParams.newTiles;
    const newParentUrls = tileToDownload.map((tile) => {
      return tile.url;
    });
    const parentUrls =  oldRegion.parentUrls.concat(newParentUrls);
    region.parentUrls = parentUrls;

    const newFeatureText = tileToDownload.map((tile) => {
      return tile.featureText;
    });
    region.parentFeatureText = oldRegion.parentFeatureText.concat(newFeatureText);

    const depth = oldRegion.generationParams.endLevel - oldRegion.generationParams.startLevel;
    const numberOfTiles = this.getNumberOfTiles(parentUrls.length, depth);
    region.numberOfTiles = numberOfTiles;

    region.status = RegionStatus.Downloading;

    this.regionDB.update(region);
    return region;
  }

  public updateRegion(oldRegion: RegionDBData, updateParams: RegionUpdateParams) {
    const region = this.updateRegionDBData(oldRegion, updateParams);

    const regionID = oldRegion.id;
    const tileToDownload = updateParams.newTiles;
    const depth = region.generationParams.endLevel - region.generationParams.startLevel;
    for (const tile of tileToDownload) {
      this.tileDownloader.downloadFromCoord(
        tile.coord,
        regionID,
        depth,
        tile.tileGrid,
        tile.templateUrl
      );
    }
    
    const dbRequest = this.tileDB.getRegionByID(regionID)
      .pipe(
        map((tiles: TileDBData[]) => {
          return tiles.map((tile) => { return tile.url; });
        })
      );
    
    dbRequest.subscribe((urls: string[]) => {
      this.tileDownloader.downloadFromUrls(urls, regionID);
      const collisionMap = this.tileDB.collisionsMap;
      const validTile = this.tileDownloader.validDownloadCount;
      
      region.numberOfTiles = validTile;
      region.timestamp = new Date();
      region.status = RegionStatus.OK;
      
      this.regionDB.update(region);
      this.regionDB.updateWithCollisions(collisionMap);
      this.tileDB.resetCollisionMap();
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

  public getNumberOfTiles(nParents: number, depth: number) {
    return this.tileDownloader.numberOfTiles(depth) * nParents;
  }
}
