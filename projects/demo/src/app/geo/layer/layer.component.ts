import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { PanelComponent } from '@igo2/common/panel';
import {
  DataSourceService,
  DownloadButtonComponent,
  FILTER_DIRECTIVES,
  FeatureDataSource,
  IgoMap,
  ImageLayer,
  ImageLayerOptions,
  LAYER_DIRECTIVES,
  LayerOptions,
  LayerService,
  MAP_DIRECTIVES,
  METADATA_DIRECTIVES,
  MapViewOptions,
  MetadataLayerOptions,
  OSMDataSource,
  OSMDataSourceOptions,
  OgcFilterableDataSourceOptions,
  VectorLayerOptions,
  WFSDataSourceOptions,
  WMSDataSource,
  WMSDataSourceOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    MAP_DIRECTIVES,
    PanelComponent,
    LAYER_DIRECTIVES,
    METADATA_DIRECTIVES,
    DownloadButtonComponent,
    FILTER_DIRECTIVES
  ]
})
export class AppLayerComponent {
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    maxLayerZoomExtent: [-11000000, 4500000, -4500000, 10000000],
    zoom: 7
  };

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      } satisfies OSMDataSourceOptions)
      .subscribe((dataSource: OSMDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            baseLayer: true,
            visible: true,
            source: dataSource
          } satisfies LayerOptions)
        );
      });
    interface WFSoptions
      extends WFSDataSourceOptions,
        OgcFilterableDataSourceOptions {}

    const wfsDatasourceCustomEPSG: WFSoptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: 'geojson',
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
      .subscribe((dataSource: FeatureDataSource) => {
        const layerOptions: VectorLayerOptions = {
          title: 'WFS (Custom EPSG)',
          visible: true,
          source: dataSource,
          removable: false
        };
        this.map.addLayer(this.layerService.createLayer(layerOptions));
      });

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
      } satisfies ImageLayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

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
      } satisfies ImageLayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

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
      } satisfies ImageLayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

    this.layerService
      .createAsyncLayer({
        title: 'Direction du vent',
        visible: false,
        legendOptions: {
          stylesAvailable: [
            { name: 'WDIR6-LINEAR', title: 'WDIR6-LINEAR' },
            { name: 'WDIR6', title: 'WDIR6' },
            { name: 'WDIR3-LINEAR', title: 'WDIR3-LINEAR' },
            { name: 'WDIR3', title: 'WDIR3' }
          ]
        },
        sourceOptions: {
          type: 'wms',
          url: 'https://geo.weather.gc.ca/geomet?lang=fr',
          params: {
            LAYERS: 'HRDPS.CONTINENTAL_WD',
            VERSION: '1.3.0'
          }
        }
      } satisfies ImageLayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

    this.layerService
      .createAsyncLayer({
        title: 'District écologique',
        visible: false,
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/mffpecofor.fcgi',
          params: {
            LAYERS: 'sh_dis_eco',
            VERSION: '1.3.0'
          }
        }
      } satisfies ImageLayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

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
      } satisfies ImageLayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

    const datasource: WMSDataSourceOptions = {
      type: 'wms',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
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
      .subscribe((dataSource: WMSDataSource) => {
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
