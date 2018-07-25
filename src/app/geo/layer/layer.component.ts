import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { IgoMap, DataSourceService, LayerService } from '@igo2/geo';

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
        type: 'osm',
        title: 'OSM'
      })
      .subscribe(dataSource => {
        this.map.addLayer(this.layerService.createLayer(dataSource, {}));
      });

    this.dataSourceService
      .createAsyncDataSource({
        type: 'wms',
        title: 'School board',
        url: 'https://geoegl.msp.gouv.qc.ca/ws/igo_gouvouvert.fcgi',
        params: {
          layers: 'MELS_CS_ANGLO_S',
          version: '1.3.0'
        }
      })
      .subscribe(dataSource => {
        this.map.addLayer(this.layerService.createLayer(dataSource, {}));
      });

    this.dataSourceService
      .createAsyncDataSource({
        type: 'wms',
        title: 'Enclave',
        url: 'https://geoegl.msp.gouv.qc.ca/ws/igo_gouvouvert.fcgi',
        params: {
          layers: 'MTQ_511_P',
          version: '1.3.0'
        }
      })
      .subscribe(dataSource => {
        this.map.addLayer(this.layerService.createLayer(dataSource, {}));
      });
  }
}
