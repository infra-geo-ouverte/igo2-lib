import { AfterViewInit, Component, OnInit } from '@angular/core';

import {
  DataSourceService,
  FEATURE,
  Feature,
  FeatureMotion,
  IgoMap,
  LayerOptions,
  LayerService,
  MAP_DIRECTIVES,
  MapViewOptions,
  OSMDataSource,
  OSMDataSourceOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, MAP_DIRECTIVES]
})
export class AppOverlayComponent implements OnInit, AfterViewInit {
  public map: IgoMap = new IgoMap({
    overlay: true,
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 6
  };

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {}

  ngOnInit(): void {
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
  }

  ngAfterViewInit(): void {
    const feature1: Feature = {
      type: FEATURE,
      projection: 'EPSG:4326',
      meta: {
        id: 1
      },
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [-73, 46.6]
      }
    };

    const feature2: Feature = {
      type: FEATURE,
      projection: 'EPSG:4326',
      meta: {
        id: 2
      },
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-72, 47.8],
          [-73.5, 47.4],
          [-72.4, 48.6]
        ]
      }
    };

    const feature3: Feature = {
      type: FEATURE,
      projection: 'EPSG:4326',
      meta: {
        id: 3
      },
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-71, 46.8],
            [-73, 47],
            [-71.2, 46.6]
          ]
        ]
      }
    };

    this.map.overlay.setFeatures(
      [feature1, feature2, feature3] satisfies Feature[],
      FeatureMotion.None
    );
  }
}
