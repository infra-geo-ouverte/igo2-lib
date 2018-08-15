import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  WMSDataSourceOptions,
  MetadataDataSourceOptions
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
        title: 'School board',
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/igo2/api/ws/igo_gouvouvert.fcgi',
          params: {
            layers: 'MELS_CS_ANGLO_S',
            version: '1.3.0'
          }
        }
      })
      .subscribe(l => this.map.addLayer(l));

    interface WMSoptions
      extends WMSDataSourceOptions,
        MetadataDataSourceOptions {}

    const datasource: WMSoptions = {
      type: 'wms',
      url: 'https://geoegl.msp.gouv.qc.ca/igo2/api/ws/igo_gouvouvert.fcgi',
      params: {
        layers: 'vg_observation_v_inondation_embacle_wmst',
        version: '1.3.0'
      },
      metadata: {
        url:
          'https://www.donneesquebec.ca/recherche/fr/dataset/historique-publique-d-embacles-repertories-au-msp',
        extern: true
      }
    };

    this.dataSourceService
      .createAsyncDataSource(datasource)
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Embâcle',
            source: dataSource
          })
        );
      });
  }
}
