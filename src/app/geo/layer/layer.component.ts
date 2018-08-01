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
      .subscribe((dataSource: any) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource
          })
        );
      });

    this.dataSourceService
      .createAsyncDataSource({
        type: 'wms',
        url: 'https://geoegl.msp.gouv.qc.ca/ws/igo_gouvouvert.fcgi',
        params: {
          layers: 'MELS_CS_ANGLO_S',
          version: '1.3.0'
        }
      })
      .subscribe((dataSource: any) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'School board',
            source: dataSource
          })
        );
      });

    // interface options extends WMSDataSourceOptions, MetadataDataSourceOptions {}

    const datasource: any = {
      type: 'wms',
      projection: 'EPSG:4326',
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
      .subscribe((dataSource: any) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Embâcle',
            source: dataSource
          })
        );
      });
  }
}
