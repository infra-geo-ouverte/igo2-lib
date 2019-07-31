import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  WMSDataSourceOptions,
  LayerOptions,
  WFSDataSourceOptions,
  OgcFilterableDataSourceOptions,
  MetadataLayerOptions
} from '@igo2/geo';

@Component({
  selector: 'app-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss']
})
export class AppLayerComponent {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 7
  };

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {
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


    this.layerService
      .createAsyncLayer({
        title: "Point temps réel",
        visible: true,
        sourceOptions: {
          type: "websocket",
          url: "wss://testgeoegl.msp.gouv.qc.ca/apis/gps/",
          formatOptions: {
                  dataProjection: "EPSG:4326",
                  featureProjection: "EPSG:3857"
                },
          onmessage: "delete"
        },
          animation: {
          duration: 3000
        }

      })
      .subscribe(l => this.map.addLayer(l));

  }
}
