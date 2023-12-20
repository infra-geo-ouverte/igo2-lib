import { Component } from '@angular/core';

import {
  DataSourceService,
  DrawComponent,
  FeatureStore,
  FeatureWithDraw,
  IgoMap,
  LayerService,
  MapBrowserComponent,
  MapService,
  ZoomButtonComponent
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss'],
  standalone: true,
  imports: [
    MapBrowserComponent,
    ZoomButtonComponent,
    DrawComponent,
    DocViewerComponent,
    ExampleViewerComponent
  ]
})
export class AppDrawComponent {
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
      })
      .subscribe((dataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource
          })
        );
      });
  }
}
