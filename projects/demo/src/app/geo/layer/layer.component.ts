import { Component, inject } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { PanelComponent } from '@igo2/common/panel';
import {
  AnyLayerOptions,
  DownloadButtonComponent,
  FILTER_DIRECTIVES,
  FeatureDataSourceOptions,
  IgoMap,
  ImageLayerOptions,
  LAYER_DIRECTIVES,
  LayerGroupOptions,
  LayerService,
  LayerViewerComponent,
  LayerViewerOptions,
  MAP_DIRECTIVES,
  METADATA_DIRECTIVES,
  MapViewOptions,
  ProjectionService,
  VectorLayerOptions,
  WFSDataSourceOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-layer',
  templateUrl: './layer.component.html',
  styleUrls: ['./layer.component.scss'],
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    MAP_DIRECTIVES,
    LayerViewerComponent,
    PanelComponent,
    LAYER_DIRECTIVES,
    METADATA_DIRECTIVES,
    DownloadButtonComponent,
    FILTER_DIRECTIVES
  ]
})
export class AppLayerComponent {
  private layerService = inject(LayerService);
  private projectionService = inject(ProjectionService);

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

  get layerViewerOptions(): LayerViewerOptions {
    return {
      legend: {
        showForVisibleLayers: false
      },
      queryBadge: true
    };
  }

  constructor() {
    const layers: AnyLayerOptions[] = [
      {
        title: 'OSM',
        baseLayer: true,
        visible: true,
        sourceOptions: {
          type: 'osm'
        }
      },
      {
        title: 'WFS (Custom EPSG)',
        visible: true,
        sourceOptions: {
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
        } as WFSDataSourceOptions
      },
      {
        title: 'Groupe',
        type: 'group',
        children: [
          {
            title: 'Parcs routiers',
            sourceOptions: {
              type: 'wms',
              url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
              params: {
                LAYERS: 'parc_routier',
                VERSION: '1.3.0'
              }
            }
          } satisfies ImageLayerOptions
        ]
      } satisfies LayerGroupOptions,
      {
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
      } satisfies ImageLayerOptions,
      {
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
      } satisfies ImageLayerOptions,
      {
        title: 'Direction du vent',
        visible: false,
        sourceOptions: {
          optionsFromCapabilities: true,
          type: 'wms',
          url: 'https://geo.weather.gc.ca/geomet?lang=fr',
          params: {
            LAYERS: 'HRDPS.CONTINENTAL_WD',
            VERSION: '1.3.0'
          }
        }
      } satisfies ImageLayerOptions,
      {
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
      } satisfies ImageLayerOptions,
      {
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
      } satisfies ImageLayerOptions,
      {
        title: 'Embâcles',
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
          refreshIntervalSec: 15,
          params: {
            LAYERS: 'vg_observation_v_inondation_embacle_wmst',
            VERSION: '1.3.0'
          }
        },
        metadata: {
          url: 'https://www.donneesquebec.ca/recherche/fr/dataset/historique-publique-d-embacles-repertories-au-msp',
          extern: true
        }
      },
      {
        id: 'mandatory_to_retrieve_layerData_in_IDB',
        title: "Aéroport préloadé et chargé dans l'Indexed-db",
        visible: false,
        idbInfo: { storeToIdb: true },
        sourceOptions: {
          preload: { bypassResolution: true, bypassVisible: true },
          type: 'vector',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq?service=wfs&version=2.0.0&request=getfeature&typename=aeroport&srsname=EPSG:4326&outputformat=geojson'
        } satisfies FeatureDataSourceOptions
      } satisfies VectorLayerOptions,
      {
        title: 'Geostyler - Réseau routier MTQ',
        visible: true,
        sourceOptions: {
          type: 'wfs',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
          params: {
            featureTypes: 'bgr_v_sous_route_res_sup_act',
            fieldNameGeometry: 'geometry',
            maxFeatures: 15000,
            outputFormat: 'geojson'
          }
        } satisfies WFSDataSourceOptions,
        igoStyle: {
          geostylerStyle: {
            global: {
              name: '',
              rules: [
                {
                  name: 'Autoroute MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#e20a16',
                      width: 5,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#ffd80c',
                      width: 3,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Autoroute'],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Autoroute (Gestion fédérale ou PPP)',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#e20a16',
                      width: 5,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#ffebbe',
                      width: 3,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Autoroute'],
                    ['!=', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Nationale (Gestion fédérale ou PPP',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#ab595d',
                      width: 4,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#ed8186',
                      width: 2,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Nationale'],
                    ['!=', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Nationale MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#62050a',
                      width: 4,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#f00000',
                      width: 2,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Nationale'],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Régionale MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#000000',
                      width: 4,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#e7971d',
                      width: 3,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Régionale'],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Collectrice MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#861c24',
                      width: 3,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#e7641d',
                      width: 2.5,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Collectrice'],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Accès aux ressources et accès aux localités isolées MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#5f5d5c',
                      width: 2,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#d2d2d2',
                      width: 1,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    [
                      '||',
                      ['==', 'des_clasf_', 'Accès aux ressources'],
                      [
                        '==',
                        'des_clasf_',
                        'Accès aux ressources et aux localités isolées'
                      ]
                    ],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Local 1-2-3 MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#5f5d5c',
                      width: 2,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#d2d2d2',
                      width: 1,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    [
                      '||',
                      ['==', 'des_clasf_', 'Local 1'],
                      ['==', 'des_clasf_', 'Local 2'],
                      ['==', 'des_clasf_', 'Local 3']
                    ],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                }
              ]
            }
          }
        }
      } satisfies VectorLayerOptions,

      {
        title: 'Lines - MVT',
        id: 'mvtsbap',
        visible: false,
        maxResolution: 1500,
        sourceOptions: {
          featureClass: 'feature',
          type: 'mvt',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq?mode=tile&tilemode=gmap&tile={x}+{y}+{z}&layers=bgr_v_sous_route_res_sup_act&map.imagetype=mvt'
        },
        igoStyle: {
          geostylerStyle: {
            global: {
              name: '',
              rules: [
                {
                  name: 'Autoroute MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#e20a16',
                      width: 5,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#ffd80c',
                      width: 3,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Autoroute'],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Autoroute (Gestion fédérale ou PPP)',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#e20a16',
                      width: 5,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#ffebbe',
                      width: 3,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Autoroute'],
                    ['!=', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Nationale (Gestion fédérale ou PPP',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#ab595d',
                      width: 4,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#ed8186',
                      width: 2,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Nationale'],
                    ['!=', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Nationale MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#62050a',
                      width: 4,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#f00000',
                      width: 2,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Nationale'],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Régionale MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#000000',
                      width: 4,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#e7971d',
                      width: 3,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Régionale'],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Collectrice MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#861c24',
                      width: 3,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#e7641d',
                      width: 2.5,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    ['==', 'des_clasf_', 'Collectrice'],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Accès aux ressources et accès aux localités isolées MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#5f5d5c',
                      width: 2,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#d2d2d2',
                      width: 1,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    [
                      '||',
                      ['==', 'des_clasf_', 'Accès aux ressources'],
                      [
                        '==',
                        'des_clasf_',
                        'Accès aux ressources et aux localités isolées'
                      ]
                    ],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                },
                {
                  name: 'Local 1-2-3 MTQ',
                  symbolizers: [
                    {
                      kind: 'Line',
                      color: '#5f5d5c',
                      width: 2,
                      visibility: true,
                      join: 'round',
                      opacity: 0.5,
                      cap: 'butt'
                    },
                    {
                      kind: 'Line',
                      color: '#d2d2d2',
                      width: 1,
                      visibility: true,
                      cap: 'butt',
                      join: 'round'
                    }
                  ],
                  filter: [
                    '&&',
                    [
                      '||',
                      ['==', 'des_clasf_', 'Local 1'],
                      ['==', 'des_clasf_', 'Local 2'],
                      ['==', 'des_clasf_', 'Local 3']
                    ],
                    ['==', 'nom_orgns_', 'MTQ']
                  ]
                }
              ]
            }
          }
        }
      }
    ];

    this.layerService
      .createLayers(layers)
      .subscribe((layers) => this.map.layerController.add(...layers));
  }
}
