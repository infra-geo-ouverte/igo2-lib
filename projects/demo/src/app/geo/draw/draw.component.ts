import { Component } from '@angular/core';

import {
  DataSourceService,
  FeatureStore,
  FeatureWithDraw,
  IgoMap,
  LayerOptions,
  LayerService,
  MapService,
  MapViewOptions,
  OSMDataSource,
  OSMDataSourceOptions
} from '@igo2/geo';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss']
})
export class AppDrawComponent {
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
    projection: 'EPSG:3857'
  };

  public stores: FeatureStore<FeatureWithDraw>[] = [];

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private mapService: MapService
  ) {
    this.mapService.setMap(this.map);
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      } satisfies OSMDataSourceOptions)
      .subscribe((dataSource: OSMDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            baseLayer: true,
            visible: true
          } satisfies LayerOptions)
        );
      });
  }
}
