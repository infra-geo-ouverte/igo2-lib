import { Injectable } from '@angular/core';
import { RegionDBService } from './region-db.service';
import { RegionStatus, RegionTileDBData } from './Region.interface';


@Injectable({
  providedIn: 'root'
})
export class RegionDBAdminService {
  private static readonly ONE_DAY = 1000 * 60 * 60 * 24;
  private readonly expirationInterval = 30 * RegionDBAdminService.ONE_DAY;
  
  constructor(private regionDB: RegionDBService) { }

  updateStatus(region: RegionTileDBData, newStatus: RegionStatus) {
    const updatedRegion: RegionTileDBData = region;
    updatedRegion.status = newStatus;
    this.regionDB.update(updatedRegion);
  }

  checkExpirations() {
    // for every region in db check if currentDate - downloadedDate < expirationInterval
    
  }
}
