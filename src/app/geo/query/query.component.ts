import { Component } from '@angular/core';

import * as ol from 'openlayers';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  FeatureDataSource,
  DataSourceService,
  LayerService,
  OverlayService,
  Feature,
  FeatureType,
  FeatureService
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
    const feature1 = new ol.Feature({
      name: 'feature1',
      geometry: new ol.geom.LineString([
        ol.proj.transform([-72, 47.8], 'EPSG:4326', 'EPSG:3857'),
        ol.proj.transform([-73.5, 47.4], 'EPSG:4326', 'EPSG:3857'),
        ol.proj.transform([-72.4, 48.6], 'EPSG:4326', 'EPSG:3857')
      ])
    });

    const feature2 = new ol.Feature({
      name: 'feature2',
      geometry: new ol.geom.Point(
        ol.proj.transform([-73, 46.6], 'EPSG:4326', 'EPSG:3857')
      )
    });

    const feature3 = new ol.Feature({
      name: 'feature3',
      geometry: new ol.geom.Polygon([
        [
          ol.proj.transform([-71, 46.8], 'EPSG:4326', 'EPSG:3857'),
          ol.proj.transform([-73, 47], 'EPSG:4326', 'EPSG:3857'),
          ol.proj.transform([-71.2, 46.6], 'EPSG:4326', 'EPSG:3857')
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
