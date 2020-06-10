import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  WMSDataSourceOptions,
  WFSDataSourceOptions,
  WFSDataSourceOptionsParams,
  OgcFilterableDataSourceOptions,
  AnyBaseOgcFilterOptions,
  OgcFilterOperatorType,
  OgcFilterDuringOptions,
  TimeFilterType
} from '@igo2/geo';

@Component({
  selector: 'app-ogc-filter',
  templateUrl: './ogc-filter.component.html',
  styleUrls: ['./ogc-filter.component.scss']
})
export class AppOgcFilterComponent {
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

    interface WFSoptions
      extends WFSDataSourceOptions,
        OgcFilterableDataSourceOptions {}

    const datasource: WFSoptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
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
            },
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
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Embâcle (PropertyIsEqualTo OR Intersects)',
            source: dataSource,
            style: {
              circle : {
                radius: 5,
                fill: {
                  color: 'white'
                },
                stroke: {
                  color: 'orange',
                  width: 1
                }
              }
            }
          })
        );
      });

    const datasourceDuringFilter: WFSoptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'SHP' // based on service capabilities
      },
      sourceFields: [
        { name: 'date_observation', alias: 'Date de l\'observation', allowedOperatorsType: 'Time' as OgcFilterOperatorType }
      ],
      ogcFilters: {
        enabled: true,
        editable: true,
        allowedOperatorsType: OgcFilterOperatorType.All,
        filters:
          {
            operator: 'during',
            propertyName: 'date_observation',
            begin: '2016-01-21T05:00:00.000Z',
            end: '2016-01-25T05:00:00.000Z'
          } as OgcFilterDuringOptions
      },
      minDate: '2016-01-01T05:00:00Z',
      maxDate: '2019-01-01T05:00:00Z',
      stepDate: 'P2D'
    };

    this.dataSourceService
      .createAsyncDataSource(datasourceDuringFilter)
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Embâcle (During, Step: P2D)',
            id: '1',
            source: dataSource,
            style: {
              circle: {
                radius: 5,
                fill: {
                  color: 'white'
                },
                stroke: {
                  color: 'blue',
                  width: 1
                }
              }
            }
          })
        );
      });

    interface WMSoptions
    extends WMSDataSourceOptions,
      OgcFilterableDataSourceOptions {}

    const wmsOgcFilterOptions: WMSoptions = {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
          optionsFromCapabilities: true,
          params: {
            LAYERS: 'vg_observation_v_inondation23avril2017_wmst',
            VERSION: '1.3.0'
          },
          sourceFields: [
            { name: 'date_observation', alias: 'Date de l\'observation', allowedOperatorsType: 'Time' as OgcFilterOperatorType }
          ],
          ogcFilters: {
            enabled: true,
            editable: true,
            filters:
            {
              operator: 'during',
              propertyName: 'date_observation'
            } as OgcFilterDuringOptions,
            allowedOperatorsType: OgcFilterOperatorType.Time
          }
    };

    this.dataSourceService
      .createAsyncDataSource(wmsOgcFilterOptions)
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Inondation (During, optionsFromCapabilities)',
            source: dataSource
          })
        );
      });

    const filterableWMSwithPushButtons: WMSoptions = {
      type: 'wms',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/swtq',
      urlWfs: 'https://geoegl.msp.gouv.qc.ca/apis/ws/swtq',
      params: {
        LAYERS: 'radars_photos',
        VERSION: '1.3.0'
      },
      ogcFilters: {
        enabled: true,
        editable: true,
        pushButtons: {
          groups : [
            {title: 'Nom du group1', name: '1', ids : ['id1']},
            {title: 'Nom du group2', name: '2', ids : ['id1', 'id2']},
          ],
          bundles: [
          {
            id: 'id1',
            logical: 'Or',
            buttons: [
              {
                title: 'Radar photo fixe',
                enabled: true,
                color: '0,0,255',
                tooltip: 'Here a tooltip explaning ...',
                filters: {
                  operator: 'PropertyIsEqualTo',
                  propertyName: 'typeAppareil',
                  expression: 'Radar photo fixe'
                }
              },
              {
                title: 'Radar photo mobile',
                enabled: false,
                color: '255,200,0',
                tooltip: 'Here a tooltip explaning ...',
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
                tooltip: 'Here a tooltip explaning ...',
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
                tooltip: 'Here a tooltip explaning ...',
                filters: {
                  operator: 'PropertyIsEqualTo',
                  propertyName: 'typeAppareil',
                  expression: 'Appareil de surveillance au feu rouge'
                }
              }
            ]
          },
          {
            id: 'id2',
            logical: 'Or',
            vertical: true,
            buttons: [
              {
                title: 'Montréal & Laval',
                enabled: false,
                tooltip: 'Here a tooltip explaning ...',
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
                tooltip: 'Here a tooltip explaning ...',
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
        allowedOperatorsType: OgcFilterOperatorType.Basic
      },
      paramsWFS: {
        featureTypes: 'radars_photos',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '1.1.0',
        outputFormat: 'geojson',
        outputFormatDownload: 'shp'
      } as WFSDataSourceOptionsParams
    };

    this.dataSourceService
      .createAsyncDataSource(filterableWMSwithPushButtons)
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Filterable WMS layers with predefined filters (buttons)',
            source: dataSource
          })
        );
      });

  }
}
