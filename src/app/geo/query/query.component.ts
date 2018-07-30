import { Component } from '@angular/core';

import FeatureOL from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';
import { transform as transformProj } from 'ol/proj.js';

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
    const feature1 = new FeatureOL({
      name: 'feature1',
      geometry: new LineString([
        transformProj([-72, 47.8], 'EPSG:4326', 'EPSG:3857'),
        transformProj([-73.5, 47.4], 'EPSG:4326', 'EPSG:3857'),
        transformProj([-72.4, 48.6], 'EPSG:4326', 'EPSG:3857')
      ])
    });

    const feature2 = new FeatureOL({
      name: 'feature2',
      geometry: new Point(transformProj([-73, 46.6], 'EPSG:4326', 'EPSG:3857'))
    });

    const feature3 = new FeatureOL({
      name: 'feature3',
      geometry: new Polygon([
        [
          transformProj([-71, 46.8], 'EPSG:4326', 'EPSG:3857'),
          transformProj([-73, 47], 'EPSG:4326', 'EPSG:3857'),
          transformProj([-71.2, 46.6], 'EPSG:4326', 'EPSG:3857')
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
