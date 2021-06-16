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
    private regionDB: RegionDBService
  ) { 
    this.updateRegions();
    
    this.regionDB.update$.subscribe(() => {
        this.updateRegions();
      }
    );
  }

  updateRegions() {
    this.regionDB.getAll().pipe(first())
      .subscribe((regions: DBRegion[]) => {
        this.regions = regions;
      });
  }

  ngOnInit() {

  }

  public removeRegion(region) {
    this.regionDB.remove(region);
    console.log("Remove ", region);
  }

  public editRegion(region) {
    console.log("Edit ", region);
  }

  public getRegion(row: DBRegion) {
    this.selectedRegionUrls = row.parentUrls;
    this.selectedRowID = row.id;
  }
}
