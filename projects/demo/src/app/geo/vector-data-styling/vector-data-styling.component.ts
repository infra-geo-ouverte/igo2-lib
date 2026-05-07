import { CUSTOM_ELEMENTS_SCHEMA, Component, inject } from '@angular/core';

import {
  AnyLayerOptions,
  IgoMap,
  LayerService,
  MapBrowserComponent,
  MapService,
  MapViewOptions,
  ZoomButtonComponent
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';
import './hello-world-element';

@Component({
  selector: 'app-vector-data-styling',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    ExampleViewerComponent,
    DocViewerComponent,
    MapBrowserComponent,
    ZoomButtonComponent
  ],
  templateUrl: './vector-data-styling.component.html',
  styleUrl: './vector-data-styling.component.scss'
})
export class AppVectorDataStylingComponent {
  private layerService = inject(LayerService);
  private mapService = inject(MapService);

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

  constructor() {
    this.mapService.setMap(this.map);

    const layers: AnyLayerOptions[] = [
      {
        title: 'OSM',
        sourceOptions: {
          type: 'osm'
        },
        baseLayer: true,
        visible: true
      },
      {
        title: 'Structures',
        sourceOptions: {
          type: 'vector',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq?service=wfs&version=2.0.0&request=getfeature&typename=ms:gsq_v_desc_strct_tri&outfile=Structure&srsname=EPSG:4326&outputformat=geojson'
        }
      }
    ];

    this.layerService
      .createLayers(layers)
      .subscribe((layers) => this.map.layerController.add(...layers));
  }
}
