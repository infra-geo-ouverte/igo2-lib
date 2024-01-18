import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import {
  IgoMap,
  ImageLayer,
  ImageLayerOptions,
  LayerService,
  MAP_DIRECTIVES,
  MapViewOptions,
  PrintComponent,
  TileLayer,
  TileLayerOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    MAP_DIRECTIVES,
    PrintComponent
  ]
})
export class AppPrintComponent {
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: false
      }
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 9
  };

  constructor(private layerService: LayerService) {
    this.layerService
      .createAsyncLayer({
        title: 'Quebec Base Map',
        baseLayer: true,
        visible: true,
        sourceOptions: {
          type: 'xyz',
          url: 'https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/carte_gouv_qc_public@EPSG_3857/{z}/{x}/{-y}.png',
          crossOrigin: 'anonymous'
        }
      } satisfies TileLayerOptions)
      .subscribe((layer: TileLayer) => this.map.addLayer(layer));

    this.layerService
      .createAsyncLayer({
        title: 'Embâcles',
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
          params: {
            LAYERS: 'vg_observation_v_inondation_embacle_wmst',
            VERSION: '1.3.0'
          },
          crossOrigin: 'anonymous'
        }
      } satisfies ImageLayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

    this.layerService
      .createAsyncLayer({
        title: 'Radar météo',
        sourceOptions: {
          type: 'wms',
          url: 'http://geo.weather.gc.ca/geomet/?lang=fr',
          params: {
            LAYERS: 'RADAR_1KM_RRAI',
            VERSION: '1.3.0'
          },
          crossOrigin: 'anonymous'
        }
      } satisfies ImageLayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

    this.layerService
      .createAsyncLayer({
        title: 'Aéroports',
        sourceOptions: {
          type: 'wms',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq?',
          params: {
            layers: 'aeroport',
            version: '1.3.0'
          },
          crossOrigin: 'anonymous'
        }
      } satisfies ImageLayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));
  }
}
