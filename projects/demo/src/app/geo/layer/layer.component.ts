import { Component } from '@angular/core';

import {
  DataSource,
  DataSourceService,
  IgoMap,
  Layer,
  LayerOptions,
  LayerService,
  MetadataLayerOptions,
  OgcFilterableDataSourceOptions,
  WFSDataSourceOptions,
  WMSDataSourceOptions
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
    maxLayerZoomExtent: [-11000000, 4500000, -4500000, 10000000],
    zoom: 7
  };

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {
    // Couche OSM
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe((dataSource: DataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            baseLayer: true,
            visible: true,
            source: dataSource
          })
        );
      });

    //Couche WFS (Custom EPSG)
    interface WFSoptions
      extends WFSDataSourceOptions,
        OgcFilterableDataSourceOptions {}

    const wfsDatasourceCustomEPSG: WFSoptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: 'geojson_utf8',
        srsName: 'EPSG:32198',
        outputFormatDownload: 'shp'
      },
      ogcFilters: {
        enabled: true,
        editable: false,
        filters: {
          operator: 'PropertyIsEqualTo',
          propertyName: 'code_municipalite',
          expression: '12072'
        }
      },
      formatOptions: {
        dataProjection: 'EPSG:32198'
      }
    };

    this.dataSourceService
      .createAsyncDataSource(wfsDatasourceCustomEPSG)
      .subscribe((dataSource: DataSource) => {
        const layerOptions: LayerOptions = {
          title: 'WFS (Custom EPSG)',
          visible: true,
          source: dataSource,
          removable: false
        };
        this.map.addLayer(this.layerService.createLayer(layerOptions));
      });

    // Couche Parc routiers
    this.layerService
      .createAsyncLayer({
        title: 'Parcs routiers',
        sourceOptions: {
          type: 'wms',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
          params: {
            LAYERS: 'parc_routier',
            VERSION: '1.3.0'
          }
        }
      })
      .subscribe((layer: Layer) => this.map.addLayer(layer));

    // Couche Réseau routier
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
      .subscribe((layer: Layer) => this.map.addLayer(layer));

    // Couche Lieux habités
    this.layerService
      .createAsyncLayer({
        title: 'Lieux habités',
        visible: false,
        sourceOptions: {
          type: 'wms',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
          params: {
            LAYERS: 'lieuhabite',
            VERSION: '1.3.0'
          }
        }
      })
      .subscribe((layer: Layer) => this.map.addLayer(layer));

    // Couche Distribution écoforestière
    this.layerService
      .createAsyncLayer({
        title: 'Distribution écoforestière',
        visible: false,
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/mffpecofor.fcgi',
          params: {
            LAYERS: 'sh_dis_eco',
            VERSION: '1.3.0'
          }
        }
      })
      .subscribe((layer: Layer) => this.map.addLayer(layer));

    // Couche Avertissements routiers
    this.layerService
      .createAsyncLayer({
        title: 'Avertissements routiers',
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
      .subscribe((layer: Layer) => this.map.addLayer(layer));

    // Couche Embâcles
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
      .subscribe((dataSource: DataSource) => {
        const layerOptions: LayerOptionsWithMetadata = {
          title: 'Embâcles',
          source: dataSource,
          metadata: {
            url: 'https://www.donneesquebec.ca/recherche/fr/dataset/historique-publique-d-embacles-repertories-au-msp',
            extern: true
          }
        };
        this.map.addLayer(this.layerService.createLayer(layerOptions));
      });
  }
}
