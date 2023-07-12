import { Component, OnInit } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { IgoMap, MapService, DataSourceService, LayerService } from '@igo2/geo';

@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss']
})
export class AppContextComponent implements OnInit {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 6
  };

  constructor(
    private languageService: LanguageService,
    private mapService: MapService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
  ) {
    this.mapService.setMap(this.map);
  }

  ngOnInit(): void {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource
          })
        );
      });
  }
}
