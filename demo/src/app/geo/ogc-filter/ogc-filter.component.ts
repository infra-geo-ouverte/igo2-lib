import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  WFSDataSourceOptions,
  OgcFilterableDataSourceOptions
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
        outputFormat: 'geojson'
      },
      isOgcFilterable: true,
      ogcFilters: {
        filtersAreEditable: true,
        filters: {
          operator: 'PropertyIsEqualTo',
          propertyName: 'code_municipalite',
          expression: '10043'
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
