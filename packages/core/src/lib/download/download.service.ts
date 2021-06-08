import { Injectable } from '@angular/core';
import { TileDownloaderService } from '@igo/geo';
import { Region } from './download.interface';

// need to make region db
// need to ajust download method of TileDownloaderService
// need to create regionDBService
// need to create geodata-db delete method
// need to create geodata-db deleteRegion by id or name wtv method

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  selectedRegion: Region;
  constructor(
    private tileDownloader: TileDownloaderService
  ) { }
  // need on right click method for the controler
  public downloadSelectedRegion() {
    // need to ajust download depth of tileDownloader 
  }

  public addToSelectedRegion(parentCoords: [number, number, number]) {
    // const url = generateUrl
    // 
  }

  public updateRegion(name: string) {
    // get region in db
  }

  public changeSelectedRegion(name: string) {
    const region = this.getRegion(name);
    if (region) {
      this.selectedRegion = this.getRegion(name);
    }
  }

  public getRegion(name: string): Region {
    // get Region in db
    return;
  }

  private getRegionsName() {
    // get all regions names in db
  }

  public createRegion(name: string) {
    // this.selectedRegion = new Region
    
  }

  public deleteRegion(name: string) {
    // 1) for every urls in region delete it
    // 2) or by region index in db
    // the second option seems more appropriate because it deresponsabilise
    // the DownloadService of remembering all the urls therefore saving space
    // in indexedDB
  }
}
