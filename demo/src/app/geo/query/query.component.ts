import { Component } from '@angular/core';

import olFeature from 'ol/Feature';
import olPoint from 'ol/geom/Point';
import olPolygon from 'ol/geom/Polygon';
import olLineString from 'ol/geom/LineString';
import * as olproj from 'ol/proj';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  FeatureDataSource,
  DataSourceService,
  LayerService,
  OverlayService,
  Feature,
  FeatureType,
  FeatureService,
  LayerOptions,
  OgcFilterableDataSourceOptions,
  WFSDataSourceOptions
} from '@igo2/geo';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss']
})
export class AppQueryComponent {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 6
  };

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private overlayService: OverlayService,
    private featureService: FeatureService
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

    const wfsDatasource: WFSoptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/ws/igo_gouvouvert.fcgi',
      params: {
        featureTypes: 'vg_observation_v_autre_wmst',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: 'geojson_utf8',
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

    this.dataSourceService
      .createAsyncDataSource(wfsDatasource)
      .subscribe(dataSource => {
        const layer: LayerOptions = {
          title: 'WFS ',
          visible: true,
          source: dataSource
        };
        this.map.addLayer(this.layerService.createLayer(layer));
      });

    this.layerService
      .createAsyncLayer({
        title: 'Réseau routier',
        visible: true,
        sourceOptions: {
          queryable: true,
          type: 'wms',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
          params: {
            layers: 'bgr_v_sous_route_res_sup_act',
            version: '1.3.0'
          }
        }
      })
      .subscribe(l => this.map.addLayer(l));

    this.dataSourceService
      .createAsyncDataSource({
        type: 'vector'
      })
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Vector Layer',
            source: dataSource
          })
        );
        this.addFeatures(dataSource as FeatureDataSource);
      });

    this.featureService.clear();
    this.overlayService.clear();
  }

  addFeatures(dataSource: FeatureDataSource) {
    const feature1 = new olFeature({
      name: 'feature1',
      geometry: new olLineString([
        olproj.transform([-72, 47.8], 'EPSG:4326', 'EPSG:3857'),
        olproj.transform([-73.5, 47.4], 'EPSG:4326', 'EPSG:3857'),
        olproj.transform([-72.4, 48.6], 'EPSG:4326', 'EPSG:3857')
      ])
    });

    const feature2 = new olFeature({
      name: 'feature2',
      geometry: new olPoint(
        olproj.transform([-73, 46.6], 'EPSG:4326', 'EPSG:3857')
      )
    });

    const feature3 = new olFeature({
      name: 'feature3',
      geometry: new olPolygon([
        [
          olproj.transform([-71, 46.8], 'EPSG:4326', 'EPSG:3857'),
          olproj.transform([-73, 47], 'EPSG:4326', 'EPSG:3857'),
          olproj.transform([-71.2, 46.6], 'EPSG:4326', 'EPSG:3857')
        ]
      ])
    });

    dataSource.ol.addFeatures([feature1, feature2, feature3]);
  }

  clearFeature() {
    this.featureService.clear();
    this.overlayService.clear();
  }

  handleQueryResults(results) {
    const features: Feature[] = results.features;
    if (features.length) {
      this.featureService.setFeatures(features);
    }
  }

  handleFeatureFocus(feature: Feature) {
    this.overlayService.setFeatures([feature]);
  }

  handleFeatureSelect(feature: Feature) {
    this.overlayService.setFeatures([feature]);
  }
}
