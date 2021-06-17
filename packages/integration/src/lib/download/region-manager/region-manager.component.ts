import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DBRegion, DownloadRegionService, RegionDBService } from '@igo2/core';
import { MatCarouselComponent } from '@ngbmodule/material-carousel';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { DownloadToolState } from '../download-tool/download-tool.state';

@Component({
  selector: 'igo-region-manager',
  templateUrl: './region-manager.component.html',
  styleUrls: ['./region-manager.component.scss']
})
export class RegionManagerComponent implements OnInit{
  @ViewChild('regionCarousel') regionCarousel: MatCarouselComponent;

  regions: BehaviorSubject<DBRegion[]> = new BehaviorSubject(undefined);
  displayedColumns = ['edit', 'name', 'space'];
  selectedRegionUrls: string[];
  selectedRowID: number = -1;

  constructor(
    private regionDB: RegionDBService,
    private downloadManager: DownloadRegionService
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
        this.selectedRegionUrls = undefined;
        this.regions.next(regions);
      });
  }

  ngOnInit() {

  }

  public deleteRegion(region) {
    this.downloadManager.deleteRegionByID(region.id);
  }

  public editRegion(region) {
    console.log("Edit ", region);
  }

  public getRegion(row: DBRegion) {
    this.selectedRegionUrls = row.parentUrls;
    this.selectedRowID = row.id;
    this.regionCarousel.slideTo(0);
  }
}
