import { Component, OnInit } from '@angular/core';
import { DBRegion, RegionDBService } from '@igo2/core';
import { first } from 'rxjs/operators';
import { DownloadToolState } from '../download-tool/download-tool.state';

@Component({
  selector: 'igo-region-manager',
  templateUrl: './region-manager.component.html',
  styleUrls: ['./region-manager.component.scss']
})
export class RegionManagerComponent implements OnInit {
  regions: DBRegion[] ;
  displayedColumns = ['edit', 'name', 'space'];
  selectedRegionUrls: string[];
  selectedRowID: number = -1;

  constructor(
    private regionDB: RegionDBService,
    private downloadToolState: DownloadToolState
  ) { 
    this.updateRegions();
    // need change to db
    this.downloadToolState.regionsUpToDate$
      .subscribe((upToDate: boolean) => {
        console.log("need update", upToDate);
        if (!upToDate) {
          this.updateRegions();
        }
      })
    
  }

  updateRegions() {
    this.regionDB.getAll().pipe(first())
      .subscribe((regions: DBRegion[]) => {
        this.regions = regions;
      });
    this.downloadToolState.regionUpdated();
  }
  ngOnInit() {
    console.log("on init");
  }

  getRegion(row: DBRegion) {
    console.log("Row clicked");
    console.log(row);
    this.selectedRegionUrls = row.parentUrls;
    this.selectedRowID = row.id;
  }
}
