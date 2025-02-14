import { Component } from '@angular/core';

import {
  AnyLayerOptions,
  DrawComponent,
  FeatureStore,
  FeatureWithDraw,
  IgoMap,
  LayerService,
  MapBrowserComponent,
  MapService,
  MapViewOptions,
  ZoomButtonComponent
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss'],
  imports: [
    MapBrowserComponent,
    ZoomButtonComponent,
    DrawComponent,
    DocViewerComponent,
    ExampleViewerComponent
  ]
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
    private layerService: LayerService,
    private mapService: MapService
  ) {
    this.mapService.setMap(this.map);

    const layers: AnyLayerOptions[] = [
      {
        title: 'OSM',
        sourceOptions: {
          type: 'osm'
        },
        baseLayer: true,
        visible: true
      }
    ];

    this.layerService
      .createLayers(layers)
      .subscribe((layers) => this.map.layerController.add(...layers));
  }
}
