import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  WFSDataSourceOptions,
  OgcFilterableDataSourceOptions,
  AnyBaseOgcFilterOptions
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
      url: 'https://geoegl.msp.gouv.qc.ca/igo2/api/ws/igo_gouvouvert.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: 'geojson',
        outputFormatDownload: 'SHP' // based on service capabilities
      },
      isOgcFilterable: true,
      // TODO: sourceFields: [{'name': 'code_municipalite', 'alias': '# de la municipalitée'}],
      ogcFilters: {
        filtersAreEditable: true,
        filters: {
          logical: 'Or',
          filters: [{
                      operator: 'PropertyIsEqualTo',
                      propertyName: 'code_municipalite',
                      expression: '10043'
                      },
                      {
                        operator: 'Intersects',
                        geometryName: 'the_geom',
                        wkt_geometry: `
                        MULTIPOLYGON(((
                          -8379441.158019895 5844447.897707146,-8379441.158019895 5936172.331649357,
                          -8134842.66750733 5936172.331649357,-8134842.66750733 5844447.897707146,
                          -8379441.158019895 5844447.897707146),
                          (-8015003 5942074,-8015003 5780349,-7792364 5780349,-7792364 5942074,-8015003 5942074)))
                        `}
                        /*
                        //
                        OR
                        POLYGON((
                          -8015003 5942074,-8015003 5780349,
                          -7792364 5780349,-7792364 5942074,-8015003 5942074
                        ))
                        OR
                        MULTIPOLYGON(((
                        -8379441.158019895 5844447.897707146,-8379441.158019895 5936172.331649357,
                        -8134842.66750733 5936172.331649357,-8134842.66750733 5844447.897707146,
                        -8379441.158019895 5844447.897707146),
                        (-8015003 5942074,-8015003 5780349,-7792364 5780349,-7792364 5942074,-8015003 5942074)))
                    */
          ] as AnyBaseOgcFilterOptions[]
        }
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
