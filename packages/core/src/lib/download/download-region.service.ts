import { Injectable } from '@angular/core';
import { Observable, Subscription, zip } from 'rxjs';
import { skip, timestamp } from 'rxjs/operators';
import { DBRegion, GeoDataDBService, RegionDBService } from '../storage';
import { TileDownloaderService } from './tile-downloader.service';
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
  
  constructor(
    private tileDownloader: TileDownloaderService,
    private tileDB: GeoDataDBService,
    private regionDB: RegionDBService
  ) { }
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
        console.log("done adding regionId: ", regionID);
        for (let tile of tilesToDownload) {
           // need to change tileDonwloader download method
          this.tileDownloader.downloadFromCoord(
            tile.coord, 
            regionID, 
            depth, 
            tile.tileGrid, 
            tile.templateUrl
          );
        }
      });

    this.isDownloading$$ = this.tileDownloader.isDownloading$
      .pipe(skip(1))
      .subscribe((value) => {
        if (!value) {
          this.updateAllRegionTileCount();
        }
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
        numberOfTiles: count
      })
    });
  }

  public updateAllRegionTileCount() {
    this.regionDB.getAll().subscribe((regions: DBRegion[]) => {
      regions.forEach((region: DBRegion) => {
        this.updateRegionTileCount(region);
      });
    });
  }

  public getDownloadSpaceEstimate(nTiles: number): number {
    if (!nTiles) {
      return;
    }
    return this.tileDownloader.downloadEstimate(nTiles);
  }
}
