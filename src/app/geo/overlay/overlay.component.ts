import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  OverlayService,
  Feature,
  FeatureType
} from '@igo2/geo';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss']
})
export class AppOverlayComponent {
  public map = new IgoMap({
    overlay: true,
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
    private overlayService: OverlayService
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
      source: 'testSource',
      title: 'testTitle',
      type: FeatureType.Feature,
      projection: 'EPSG:4326',
      geometry: {
        type: 'Point',
        coordinates: [-73, 46.6]
      }
    };

    const feature2: Feature = {
      id: '2',
      source: 'testSource',
      title: 'testTitle2',
      type: FeatureType.Feature,
      projection: 'EPSG:4326',
      geometry: {
        type: 'LineString',
        coordinates: [[-72, 47.8], [-73.5, 47.4], [-72.4, 48.6]]
      }
    };

    const feature3: Feature = {
      id: '3',
      source: 'testSource',
      title: 'testTitle3',
      type: FeatureType.Feature,
      projection: 'EPSG:4326',
      geometry: {
        type: 'Polygon',
        coordinates: [[[-71, 46.8], [-73, 47], [-71.2, 46.6]]]
      }
    };

    this.overlayService.setFeatures([feature1, feature2, feature3]);
  }
}
