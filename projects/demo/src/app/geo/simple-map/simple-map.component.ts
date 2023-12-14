import { Component } from '@angular/core';

import { MediaService } from '@igo2/core';
import { DataSource, DataSourceService, IgoMap, LayerService } from '@igo2/geo';

@Component({
  selector: 'app-simple-map',
  templateUrl: './simple-map.component.html',
  styleUrls: ['./simple-map.component.scss']
})
export class AppSimpleMapComponent {
  public pointerCoord: string;
  public pointerCoordDelay: number = 0;
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 6,
    rotation: 0.75
  };

  get media() {
    return this.mediaService.getMedia();
  }

  get isTouchScreen() {
    return this.mediaService.isTouchScreen();
  }

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private mediaService: MediaService
  ) {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe((dataSource: DataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            visible: true,
            baseLayer: true
          })
        );
      });
  }

  onPointerMove(event) {
    this.pointerCoord = event;
  }
}
