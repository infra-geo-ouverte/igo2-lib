import { Component } from '@angular/core';

import { Media, MediaService } from '@igo2/core';
import { DataSourceService, IgoMap, LayerOptions, LayerService, MapViewOptions, OSMDataSource, OSMDataSourceOptions } from '@igo2/geo';

@Component({
  selector: 'app-simple-map',
  templateUrl: './simple-map.component.html',
  styleUrls: ['./simple-map.component.scss']
})
export class AppSimpleMapComponent {
  public pointerCoord: string;
  public pointerCoordDelay: number = 0;
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 6,
    rotation: 0.75
  };

  get media(): Media {
    return this.mediaService.getMedia();
  }

  get isTouchScreen(): boolean {
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
      } as OSMDataSourceOptions)
      .subscribe((dataSource: OSMDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            visible: true,
            baseLayer: true
          } as LayerOptions)
        );
      });
  }

  onPointerMove(event: string): void {
    this.pointerCoord = event;
  }
}
