import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  OverlayService,
  Feature,
  FeatureType,
  FeatureService
} from '@igo2/geo';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss']
})
export class AppFeatureComponent {
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

    const feature1: Feature = {
      id: '1',
      source: 'Source1',
      title: 'Title1',
      type: FeatureType.Feature,
      projection: 'EPSG:4326',
      geometry: {
        type: 'Point',
        coordinates: [-73, 46.6]
      },
      properties: {
        attribute1: 'value1'
      }
    };

    const feature2: Feature = {
      id: '2',
      source: 'Source1',
      title: 'Title2',
      type: FeatureType.Feature,
      projection: 'EPSG:4326',
      geometry: {
        type: 'LineString',
        coordinates: [[-72, 47.8], [-73.5, 47.4], [-72.4, 48.6]]
      },
      properties: {
        attribute1: 'value2'
      }
    };

    const feature3: Feature = {
      id: '3',
      source: 'Source2',
      title: 'Title3',
      type: FeatureType.Feature,
      projection: 'EPSG:4326',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-71, 46.8], [-73, 47], [-71.2, 46.6]]]
      },
      properties: {
        attribute1: 'value3',
        attribute2: 'value3'
      }
    };

    this.featureService.setFeatures([feature1, feature2, feature3]);
    this.overlayService.clear();
  }

  clearFeatureSelected() {
    this.featureService.unselectFeature();
  }

  handleFeatureSelect(feature: Feature) {
    this.overlayService.setFeatures([feature], 'zoom');
  }
}
