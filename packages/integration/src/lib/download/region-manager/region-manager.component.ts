import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DBRegion, DownloadRegionService, RegionDBService } from '@igo2/core';
import { MatCarouselComponent } from '@ngbmodule/material-carousel';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { DownloadToolState } from '../download-tool/download-tool.state';

interface Region {
  id: number;
  name: string;
  numberOfTiles: number;
  parentUrls: string[];
}

@Component({
  selector: 'igo-region-manager',
  templateUrl: './region-manager.component.html',
  styleUrls: ['./region-manager.component.scss']
})
export class RegionManagerComponent implements OnInit{
  @ViewChild('regionCarousel') regionCarousel: MatCarouselComponent;

  regions: BehaviorSubject<Region[]> = new BehaviorSubject(undefined);
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
      .subscribe((dbRegions: DBRegion[]) => {
        this.selectedRegionUrls = undefined;
        const regions = this.createRegion(dbRegions);
        this.regions.next(regions);
      });
  }

  private createRegion(dBRegions: DBRegion[]) {
    const regions: Region[] = []
    const nameOccurences: Map<string, number> = new Map();
    for (let region of dBRegions) {
      const name = region.name;
      let occurence = nameOccurences.get(name);
      if (occurence === undefined) {
        regions.push({
          id: region.id,
          name,
          numberOfTiles: region.numberOfTiles,
          parentUrls: region.parentUrls
        });
        nameOccurences.set(name, 1);
      } else {
        const newName = name + ' (' + occurence + ')';
        regions.push({
          id: region.id,
          name: newName,
          numberOfTiles: region.numberOfTiles,
          parentUrls: region.parentUrls
        });
        nameOccurences.set(name, ++occurence);
      }
    }
    return regions;
  }

  ngOnInit() {

  }

  public deleteRegion(region) {
    this.downloadManager.deleteRegionByID(region.id);
  }

  public editRegion(region) {
    console.log("Edit ", region);
  }

  public getRegion(row: Region) {
    this.selectedRegionUrls = row.parentUrls;
    this.selectedRowID = row.id;
    this.regionCarousel.slideTo(0);
  }
}
