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
      sourceFields: [
        { name: 'code_municipalite', alias: '# de la municipalitée' },
        { name: 'date_observation' },
        { name: 'urgence', values: ['immédiate', 'inconnue'] }
      ],
      ogcFilters: {
        enabled: true,
        editable: true,
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
            title: 'Embâcle',
            source: dataSource
          })
        );
      });

    interface WMSoptions
      extends WMSDataSourceOptions,
        OgcFilterableDataSourceOptions {}

    const datasourceWms: WMSoptions = {
      type: 'wms',
      url: '/geoserver/wms',
      urlWfs: '/geoserver/wfs',
      params: {
        layers: 'water_areas',
        version: '1.3.0'
      },
      ogcFilters: {
        enabled: true,
        editable: true,
        filters: {
          operator: 'PropertyIsEqualTo',
          propertyName: 'waterway',
          expression: 'riverbank'
        }
      },
      sourceFields: [
        { name: 'waterway', alias: 'Chemin d eau' },
        { name: 'osm_id' },
        { name: 'landuse', values: ['yes', 'no'] }
      ],
      paramsWFS: {
        featureTypes: 'water_areas',
        fieldNameGeometry: 'the_geom',
        maxFeatures: 10000,
        version: '1.1.0',
        outputFormat: 'application/json',
        outputFormatDownload: 'application/vnd.google-earth.kml+xml'
      } as WFSDataSourceOptionsParams
    };

    this.dataSourceService
      .createAsyncDataSource(datasourceWms)
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Geoserver water_areas',
            source: dataSource
          })
        );
      });
  }
}
