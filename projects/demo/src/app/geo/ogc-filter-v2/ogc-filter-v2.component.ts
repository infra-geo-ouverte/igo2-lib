import { Component, inject } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { PanelComponent } from '@igo2/common/panel';
import {
  DataSourceService,
  IgoMap,
  LayerOptions,
  LayerService,
  MAP_DIRECTIVES,
  MapViewOptions,
  OSMDataSourceOptions,
  OgcFilterFacade,
  OgcFilterPanelComponent,
  OgcFilterStore,
  VectorLayerOptions,
  WFSDataSource,
  WFSDataSourceOptions,
  WMSDataSource,
  WMSDataSourceOptions,
  createWfsOgcFilterTarget,
  createWmsOgcFilterTarget
} from '@igo2/geo';

import { Circle, Fill, Stroke, Style } from 'ol/style';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

/**
 * OGC filters V2 example.
 *
 * Contrary to the legacy example (geo/ogc-filter), the filter state does not
 * live inside the datasource options: each layer owns an immutable
 * `OgcFilterConfig` parsed once into an `OgcFilterStore` (signals). The
 * `OgcFilterFacade` connects the store to the datasource through the
 * `OgcFilterTarget` port and keeps the request parameters in sync.
 */
@Component({
  selector: 'app-ogc-filter-v2',
  templateUrl: './ogc-filter-v2.component.html',
  styleUrls: ['./ogc-filter-v2.component.scss'],
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    MAP_DIRECTIVES,
    PanelComponent,
    OgcFilterPanelComponent
  ]
})
export class AppOgcFilterV2Component {
  private dataSourceService = inject(DataSourceService);
  private layerService = inject(LayerService);
  private ogcFilterFacade = inject(OgcFilterFacade);

  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-72, 46.8],
    zoom: 7
  };

  /** WMS in advanced mode: an editable rule tree (vendor FILTER param). */
  public wmsRouteStore: OgcFilterStore = this.ogcFilterFacade.createStore({
    enabled: true,
    editable: true,
    geometryName: 'geometry',
    filters: {
      operator: 'PropertyIsEqualTo',
      propertyName: 'num_route',
      expression: '00020'
    },
    fields: [{ name: 'num_route', type: 'string' }]
  });

  /** WMS in selector mode: predefined filters toggled from the UI. */
  public wmsSelectorStore: OgcFilterStore = this.ogcFilterFacade.createStore({
    enabled: true,
    editable: false,
    geometryName: 'geometry',
    selectors: [
      {
        id: 'routes',
        title: 'Routes principales',
        presentation: 'pushButton',
        logical: 'Or',
        multiple: true,
        items: [
          {
            title: 'Autoroute 20',
            enabled: true,
            filters: {
              operator: 'PropertyIsEqualTo',
              propertyName: 'num_route',
              expression: '00020'
            }
          },
          {
            title: 'Autoroute 40',
            filters: {
              operator: 'PropertyIsEqualTo',
              propertyName: 'num_route',
              expression: '00040'
            }
          },
          {
            title: 'Route 138',
            filters: {
              operator: 'PropertyIsEqualTo',
              propertyName: 'num_route',
              expression: '00138'
            }
          }
        ]
      }
    ]
  });

  /** WFS in advanced mode: same store API, WFS GetFeature encoding. */
  public wfsStore: OgcFilterStore = this.ogcFilterFacade.createStore({
    enabled: true,
    editable: true,
    geometryName: 'geometry',
    filters: {
      logical: 'Or',
      filters: [
        {
          operator: 'PropertyIsEqualTo',
          propertyName: 'code_municipalite',
          expression: '10043'
        },
        {
          operator: 'PropertyIsLike',
          propertyName: 'urgence',
          pattern: 'immédiate',
          active: false
        }
      ]
    },
    fields: [
      { name: 'code_municipalite', type: 'string' },
      { name: 'urgence', type: 'string' }
    ]
  });

  constructor() {
    this.addBaseLayer();
    this.addWmsLayer('Réseau routier (WMS, mode avancé)', this.wmsRouteStore);
    this.addWmsLayer(
      'Réseau routier (WMS, mode sélecteur)',
      this.wmsSelectorStore
    );
    this.addWfsLayer('Embâcles (WFS, mode avancé)', this.wfsStore);
  }

  private addBaseLayer(): void {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      } satisfies OSMDataSourceOptions)
      .subscribe((dataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            baseLayer: true,
            visible: true
          } satisfies LayerOptions)
        );
      });
  }

  private addWmsLayer(title: string, store: OgcFilterStore): void {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'wms',
        url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
        params: {
          LAYERS: 'bgr_v_sous_route_res_sup_act',
          VERSION: '1.3.0'
        }
      } satisfies WMSDataSourceOptions)
      .subscribe((dataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title,
            source: dataSource
          } satisfies LayerOptions)
        );
        this.ogcFilterFacade.connect(
          store,
          createWmsOgcFilterTarget(dataSource as WMSDataSource)
        );
      });
  }

  private addWfsLayer(title: string, store: OgcFilterStore): void {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'wfs',
        url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
        params: {
          featureTypes: 'vg_observation_v_autre_wmst',
          fieldNameGeometry: 'geometry',
          maxFeatures: 10000,
          version: '2.0.0',
          outputFormat: '',
          outputFormatDownload: 'SHP'
        }
      } satisfies WFSDataSourceOptions)
      .subscribe((dataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title,
            source: dataSource as WFSDataSource,
            style: new Style({
              image: new Circle({
                radius: 5,
                fill: new Fill({
                  color: 'white'
                }),
                stroke: new Stroke({
                  color: 'orange',
                  width: 1
                })
              })
            })
          } satisfies VectorLayerOptions)
        );
        this.ogcFilterFacade.connect(
          store,
          createWfsOgcFilterTarget(dataSource as WFSDataSource)
        );
      });
  }
}
