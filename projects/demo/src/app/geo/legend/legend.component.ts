import { Component } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import { LanguageService } from '@igo2/core';
import {
  DataSourceService,
  IgoLayerModule,
  IgoMap,
  IgoMapModule,
  LayerOptions,
  LayerService,
  MetadataLayerOptions,
  OgcFilterableDataSourceOptions,
  WFSDataSourceOptions,
  WMSDataSourceOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    IgoMapModule,
    IgoPanelModule,
    IgoLayerModule
  ]
})
export class AppLegendComponent {
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
      .subscribe((dataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            visible: true,
            baseLayer: true,
            source: dataSource
          })
        );
      });

    interface WFSoptions
      extends WFSDataSourceOptions,
        OgcFilterableDataSourceOptions {}

    const wfsDatasource: WFSoptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'shp'
      },
      ogcFilters: {
        enabled: true,
        editable: true,
        filters: {
          operator: 'PropertyIsEqualTo',
          propertyName: 'code_municipalite',
          expression: '10043'
        }
      }
    };

    this.layerService
      .createAsyncLayer({
        title: 'legend with display:false',
        visible: true,
        legendOptions: {
          display: false,
          html: 'test html'
        },
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/mffpecofor.fcgi',
          optionsFromCapabilities: true,
          params: {
            LAYERS: 'sh_dis_eco',
            VERSION: '1.3.0'
          }
        }
      })
      .subscribe((l) => this.map.addLayer(l));

    this.layerService
      .createAsyncLayer({
        title: 'legend in html',
        visible: true,
        legendOptions: {
          display: true,
          html: '<h2 style="background-color: blue;">HTML légende</h2>'
        },
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/mffpecofor.fcgi',
          optionsFromCapabilities: false,
          params: {
            LAYERS: 'sh_sreg_eco',
            VERSION: '1.3.0'
          }
        }
      })
      .subscribe((l) => this.map.addLayer(l));

    this.layerService
      .createAsyncLayer({
        title: 'legend with url param',
        visible: true,
        legendOptions: {
          url: `data:image/jpeg;base64,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`
        },
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/mffpecofor.fcgi',
          optionsFromCapabilities: true,
          params: {
            LAYERS: 'sh_reg_eco',
            VERSION: '1.3.0'
          }
        }
      })
      .subscribe((l) => this.map.addLayer(l));

    this.dataSourceService
      .createAsyncDataSource(wfsDatasource)
      .subscribe((dataSource) => {
        const layer: LayerOptions = {
          title: 'WFS ',
          visible: true,
          source: dataSource
        };
        this.map.addLayer(this.layerService.createLayer(layer));
      });

    this.layerService
      .createAsyncLayer({
        title: 'Commission scolaire anglophone',
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/all.fcgi',
          params: {
            LAYERS: 'WMS_MEQ_CS_ANGLO',
            VERSION: '1.3.0'
          }
        }
      })
      .subscribe((l) => this.map.addLayer(l));

    this.layerService
      .createAsyncLayer({
        title: 'Réseau routier',
        visible: false,
        sourceOptions: {
          type: 'wms',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
          params: {
            LAYERS: 'bgr_v_sous_route_res_sup_act',
            VERSION: '1.3.0'
          }
        }
      })
      .subscribe((l) => this.map.addLayer(l));

    this.layerService
      .createAsyncLayer({
        title: 'lieu habité',
        visible: false,
        sourceOptions: {
          type: 'wms',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
          optionsFromCapabilities: true,
          params: {
            LAYERS: 'lieuhabite',
            VERSION: '1.3.0'
          }
        }
      })
      .subscribe((l) => this.map.addLayer(l));

    this.layerService
      .createAsyncLayer({
        title: 'Avertissements routier',
        visible: false,
        sourceOptions: {
          type: 'wms',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
          params: {
            LAYERS: 'evenements',
            VERSION: '1.3.0'
          }
        }
      })
      .subscribe((l) => this.map.addLayer(l));

    const datasource: WMSDataSourceOptions = {
      type: 'wms',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
      refreshIntervalSec: 15,
      params: {
        LAYERS: 'vg_observation_v_inondation_embacle_wmst',
        VERSION: '1.3.0'
      }
    };

    interface LayerOptionsWithMetadata
      extends LayerOptions,
        MetadataLayerOptions {}

    this.dataSourceService
      .createAsyncDataSource(datasource)
      .subscribe((dataSource) => {
        const layer: LayerOptionsWithMetadata = {
          title: 'Embâcle',
          visible: true,
          source: dataSource,
          metadata: {
            url: 'https://www.donneesquebec.ca/recherche/fr/dataset/historique-publique-d-embacles-repertories-au-msp',
            extern: true
          }
        };
        this.map.addLayer(this.layerService.createLayer(layer));
      });
  }
}
