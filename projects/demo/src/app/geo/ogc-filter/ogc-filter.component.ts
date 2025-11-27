import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { PanelComponent } from '@igo2/common/panel';
import {
  AnyBaseOgcFilterOptions,
  DataSourceService,
  FILTER_DIRECTIVES,
  IgoMap,
  ImageLayerOptions,
  LayerOptions,
  LayerService,
  MAP_DIRECTIVES,
  MapViewOptions,
  OSMDataSource,
  OSMDataSourceOptions,
  OgcFilterAttributeOptions,
  OgcFilterDuringOptions,
  OgcFilterEqualToOptions,
  OgcFilterOperatorType,
  OgcFilterableDataSourceOptions,
  VectorLayerOptions,
  WFSDataSource,
  WFSDataSourceOptions,
  WMSDataSource,
  WMSDataSourceOptions
} from '@igo2/geo';

import { Circle, Fill, Stroke, Style } from 'ol/style';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-ogc-filter',
  templateUrl: './ogc-filter.component.html',
  styleUrls: ['./ogc-filter.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    MAP_DIRECTIVES,
    PanelComponent,
    FILTER_DIRECTIVES
  ]
})
export class AppOgcFilterComponent {
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
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
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            baseLayer: true,
            visible: true
          } satisfies LayerOptions)
        );
      });

    interface WFSOptions
      extends WFSDataSourceOptions, OgcFilterableDataSourceOptions {}

    const datasource: WFSOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'SHP' // based on service capabilities
      },
      sourceFields: [
        { name: 'code_municipalite', alias: '# de la municipalitée' },
        { name: 'date_observation', excludeFromOgcFilters: true },
        { name: 'urgence', values: ['immédiate', 'inconnue'] }
      ],
      ogcFilters: {
        enabled: true,
        editable: true,
        allowedOperatorsType: OgcFilterOperatorType.All,
        filters: {
          logical: 'Or',
          filters: [
            {
              operator: 'PropertyIsEqualTo',
              propertyName: 'code_municipalite',
              expression: '10043'
            } satisfies OgcFilterEqualToOptions,
            {
              operator: 'Intersects',
              geometryName: 'the_geom',
              wkt_geometry: `MULTIPOLYGON(((
              -8379441.158019895 5844447.897707146,
              -8379441.158019895 5936172.331649357,
              -8134842.66750733 5936172.331649357,
              -8134842.66750733 5844447.897707146,
              -8379441.158019895 5844447.897707146
            ), (
              -8015003 5942074,
              -8015003 5780349,
              -7792364 5780349,
              -7792364 5942074,
              -8015003 5942074
            )))`
            }
          ] as AnyBaseOgcFilterOptions[]
        }
      }
    };

    this.dataSourceService
      .createAsyncDataSource(datasource)
      .subscribe((dataSource: WFSDataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'Embâcles (PropertyIsEqualTo OR Intersects polygon)',
            source: dataSource,
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
      });

    const datasourceDuringFilter: WFSOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'SHP' // based on service capabilities
      },
      ogcFilters: {
        enabled: true,
        editable: true,
        allowedOperatorsType: OgcFilterOperatorType.All,
        filters: {
          operator: 'During',
          propertyName: 'date_observation',
          begin: '2016-01-21T00:00:00-05:00',
          end: '2016-01-26T00:00:00-05:00'
        } satisfies OgcFilterDuringOptions | OgcFilterAttributeOptions
      },
      minDate: '2016-01-01T00:00:00-05:00',
      maxDate: '2016-02-10T00:00:00-05:00',
      stepDate: 'P2D'
    };

    this.dataSourceService
      .createAsyncDataSource(datasourceDuringFilter)
      .subscribe((dataSource: WFSDataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'Embâcles (During, Step: P2D)',
            id: '1',
            source: dataSource,
            style: new Style({
              image: new Circle({
                radius: 5,
                fill: new Fill({
                  color: 'white'
                }),
                stroke: new Stroke({
                  color: 'red',
                  width: 1
                })
              })
            })
          } satisfies VectorLayerOptions)
        );
      });

    const datasourceDuringFilterTime: WFSOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'SHP' // based on service capabilities
      },
      sourceFields: [
        {
          name: 'date_observation',
          alias: "Date de l'observation",
          allowedOperatorsType: OgcFilterOperatorType.Time
        }
      ],
      ogcFilters: {
        enabled: true,
        editable: true,
        allowedOperatorsType: OgcFilterOperatorType.All,
        filters: {
          operator: 'During',
          propertyName: 'date_observation',
          begin: '2016-01-01T04:00:00-05:00',
          end: '2016-01-12T16:00:00-05:00'
        } satisfies OgcFilterDuringOptions | OgcFilterAttributeOptions
      },
      minDate: '2016-01-01T00:00:00-05:00',
      maxDate: '2016-02-14T20:00:00-05:00',
      stepDate: 'PT4H'
    };

    this.dataSourceService
      .createAsyncDataSource(datasourceDuringFilterTime)
      .subscribe((dataSource: WFSDataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'Embâcles (During, Step: PT4H)',
            id: '2',
            source: dataSource,
            style: new Style({
              image: new Circle({
                radius: 5,
                fill: new Fill({
                  color: 'white'
                }),
                stroke: new Stroke({
                  color: 'blue',
                  width: 1
                })
              })
            })
          } satisfies VectorLayerOptions)
        );
      });

    const datasourceDuringFilterTimeMonth: WFSOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'SHP' // based on service capabilities
      },
      sourceFields: [
        {
          name: 'date_observation',
          alias: "Date de l'observation",
          allowedOperatorsType: OgcFilterOperatorType.Time
        }
      ],
      ogcFilters: {
        enabled: true,
        editable: true,
        allowedOperatorsType: OgcFilterOperatorType.All,
        filters: {
          operator: 'During',
          propertyName: 'date_observation',
          begin: '2016-01-01T00:00:00-05:00',
          end: '2016-03-31T00:00:00-05:00',
          displayFormat: 'MMMM'
        } satisfies OgcFilterDuringOptions | OgcFilterAttributeOptions
      },
      minDate: '2016-01-01T00:00:00-05:00',
      maxDate: '2018-12-31T00:00:00-05:00',
      stepDate: 'P1M'
    };

    this.dataSourceService
      .createAsyncDataSource(datasourceDuringFilterTimeMonth)
      .subscribe((dataSource: WFSDataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'Embâcles (During, Step: P1M)',
            id: '3',
            source: dataSource,
            style: new Style({
              image: new Circle({
                radius: 5,
                fill: new Fill({
                  color: 'white'
                }),
                stroke: new Stroke({
                  color: 'yellow',
                  width: 1
                })
              })
            })
          } satisfies VectorLayerOptions)
        );
      });

    const datasourceDuringFilterTimeYear: WFSOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'SHP' // based on service capabilities
      },
      sourceFields: [
        {
          name: 'date_observation',
          alias: "Date de l'observation",
          allowedOperatorsType: OgcFilterOperatorType.Time
        }
      ],
      ogcFilters: {
        enabled: true,
        editable: true,
        allowedOperatorsType: OgcFilterOperatorType.All,
        filters: {
          operator: 'During',
          propertyName: 'date_observation',
          begin: '2014-01-01T00:00:00-05:00',
          end: '2019-12-31T00:00:00-05:00',
          displayFormat: 'YYYY'
        } satisfies OgcFilterDuringOptions | OgcFilterAttributeOptions
      },
      minDate: '2014-01-01T00:00:00-05:00',
      maxDate: '2019-12-31T00:00:00-05:00',
      stepDate: 'P1Y'
    };

    this.dataSourceService
      .createAsyncDataSource(datasourceDuringFilterTimeYear)
      .subscribe((dataSource: WFSDataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'Embâcles (During, Step: P1Y)',
            id: '4',
            source: dataSource,
            style: new Style({
              image: new Circle({
                radius: 5,
                fill: new Fill({
                  color: 'white'
                }),
                stroke: new Stroke({
                  color: 'green',
                  width: 1
                })
              })
            })
          } satisfies VectorLayerOptions)
        );
      });

    const datasourceDuringFilterTimeInterval: WFSOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'SHP' // based on service capabilities
      },
      sourceFields: [
        {
          name: 'date_observation',
          alias: "Date de l'observation",
          allowedOperatorsType: OgcFilterOperatorType.Time
        }
      ],
      ogcFilters: {
        enabled: true,
        editable: true,
        allowedOperatorsType: OgcFilterOperatorType.All,
        filters: {
          operator: 'During',
          propertyName: 'date_observation',
          begin: 'today - 2 days', // "now" can also be used. Instead of midnight, the current time will be used
          end: 'today' // "now" can also be used. Instead of midnight, the current time will be used
        } satisfies OgcFilterDuringOptions | OgcFilterAttributeOptions
      },
      minDate: '2016-01-01T00:00:00-05:00',
      maxDate: '2025-12-31T00:00:00-05:00',
      stepDate: 'P1D'
    };

    this.dataSourceService
      .createAsyncDataSource(datasourceDuringFilterTimeInterval)
      .subscribe((dataSource: WFSDataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'Embâcles (During, Interval from Now, Step: P1D)',
            id: '5',
            source: dataSource,
            style: new Style({
              image: new Circle({
                radius: 5,
                fill: new Fill({
                  color: 'white'
                }),
                stroke: new Stroke({
                  color: 'black',
                  width: 1
                })
              })
            })
          } satisfies VectorLayerOptions)
        );
      });

    const datasourceDuringFilterTimeRestrictedToStep: WFSOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'SHP' // based on service capabilities
      },
      sourceFields: [
        {
          name: 'date_observation',
          alias: "Date de l'observation",
          allowedOperatorsType: OgcFilterOperatorType.Time
        }
      ],
      ogcFilters: {
        enabled: true,
        editable: true,
        allowedOperatorsType: OgcFilterOperatorType.All,
        filters: {
          operator: 'During',
          propertyName: 'date_observation',
          begin: '2019-01-01 00:00:00',
          restrictToStep: true
        } satisfies OgcFilterDuringOptions | OgcFilterAttributeOptions
      },
      minDate: '2016-01-01T00:00:00-05:00',
      maxDate: '2025-12-31T00:00:00-05:00',
      stepDate: 'P1M'
    };

    this.dataSourceService
      .createAsyncDataSource(datasourceDuringFilterTimeRestrictedToStep)
      .subscribe((dataSource: WFSDataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'Embâcles (During, RestrictToStep, Step: P1M)',
            id: '6',
            source: dataSource,
            style: new Style({
              image: new Circle({
                radius: 5,
                fill: new Fill({
                  color: 'black'
                }),
                stroke: new Stroke({
                  color: 'red',
                  width: 1
                })
              })
            })
          } satisfies VectorLayerOptions)
        );
      });

    const wmsOgcFilterOptions: WMSDataSourceOptions = {
      type: 'wms',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/complet.fcgi',
      optionsFromCapabilities: false,
      params: {
        LAYERS: 'vg_observation_v_autre_wmst',
        VERSION: '1.3.0'
      },
      sourceFields: [
        {
          name: 'date_observation',
          alias: "Date de l'observation",
          allowedOperatorsType: OgcFilterOperatorType.Time
        }
      ],
      ogcFilters: {
        enabled: true,
        editable: true,
        filters: {
          operator: 'During',
          propertyName: 'date_observation',
          begin: '2016-01-01 00:00:00',
          end: '2020-01-01 00:00:00'
        } satisfies OgcFilterDuringOptions | OgcFilterAttributeOptions,
        allowedOperatorsType: OgcFilterOperatorType.Time
      }
    };

    this.dataSourceService
      .createAsyncDataSource(wmsOgcFilterOptions)
      .subscribe((dataSource: WMSDataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title: 'Inondations (During)',
            source: dataSource
          } satisfies ImageLayerOptions)
        );
      });

    const filterableWMSwithPushButtons: WMSDataSourceOptions = {
      type: 'wms',
      url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
      urlWfs: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
      params: {
        LAYERS: 'radars_photos',
        VERSION: '1.3.0'
      },
      ogcFilters: {
        enabled: true,
        editable: true,
        pushButtons: {
          selectorType: 'pushButton',
          order: 2,
          groups: [
            { title: 'Nom du group1 - push', name: '1 - push', ids: ['id1'] }
          ],
          bundles: [
            {
              id: 'id1',
              title: 'Régions',
              logical: 'Or',
              vertical: true,
              selectors: [
                {
                  title: 'Montréal & Laval',
                  enabled: false,
                  tooltip: 'Here a tooltip explaining ...',
                  filters: {
                    logical: 'Or',
                    filters: [
                      {
                        operator: 'PropertyIsEqualTo',
                        propertyName: 'region',
                        expression: 'Montréal'
                      },
                      {
                        operator: 'PropertyIsEqualTo',
                        propertyName: 'region',
                        expression: 'Laval'
                      }
                    ]
                  }
                },
                {
                  title: 'Outside Montréal & Laval',
                  enabled: false,
                  tooltip: 'Here a tooltip explaining ...',
                  filters: {
                    logical: 'And',
                    filters: [
                      {
                        operator: 'PropertyIsNotEqualTo',
                        propertyName: 'region',
                        expression: 'Montréal'
                      },
                      {
                        operator: 'PropertyIsNotEqualTo',
                        propertyName: 'region',
                        expression: 'Laval'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        },
        checkboxes: {
          selectorType: 'checkbox',
          order: 1,
          groups: [
            {
              title: 'Nom du group1 - checkbox',
              name: '1 - checkbox',
              ids: ['id1']
            }
          ],
          bundles: [
            {
              id: 'id1',
              title: 'Type de radar photo',
              logical: 'Or',
              selectors: [
                {
                  title: 'Radar photo fixe',
                  enabled: true,
                  tooltip: 'Here a tooltip explaining ...',
                  filters: {
                    operator: 'PropertyIsEqualTo',
                    propertyName: 'typeAppareil',
                    expression: 'Radar photo fixe'
                  }
                },
                {
                  title: 'Radar photo mobile',
                  enabled: false,
                  tooltip: 'Here a tooltip explaining ...',
                  filters: {
                    operator: 'PropertyIsEqualTo',
                    propertyName: 'typeAppareil',
                    expression: 'Radar photo mobile'
                  }
                },
                {
                  title: 'Radar photo fixe + feu rouge',
                  enabled: false,
                  color: '0,200,0',
                  tooltip: 'Here a tooltip explaining ...',
                  filters: {
                    operator: 'PropertyIsEqualTo',
                    propertyName: 'typeAppareil',
                    expression: 'Radar photo fixe et surveillance au feu rouge'
                  }
                },
                {
                  title: 'Radar feu rouge',
                  enabled: false,
                  color: '255,0,0',
                  tooltip: 'Here a tooltip explaining ...',
                  filters: {
                    operator: 'PropertyIsEqualTo',
                    propertyName: 'typeAppareil',
                    expression: 'Appareil de surveillance au feu rouge'
                  }
                }
              ]
            }
          ]
        },
        allowedOperatorsType: OgcFilterOperatorType.Basic
      },
      paramsWFS: {
        featureTypes: 'radars_photos',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '1.1.0',
        outputFormat: 'geojson',
        outputFormatDownload: 'shp'
      }
    };

    this.dataSourceService
      .createAsyncDataSource(filterableWMSwithPushButtons)
      .subscribe((dataSource: WMSDataSource) => {
        this.map.layerController.add(
          this.layerService.createLayer({
            title:
              'Filterable WMS layers with predefined filters (push buttons)',
            source: dataSource
          } satisfies ImageLayerOptions)
        );
      });
  }
}
