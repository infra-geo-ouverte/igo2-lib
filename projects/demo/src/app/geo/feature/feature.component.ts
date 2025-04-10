import { Component, OnDestroy, OnInit } from '@angular/core';

import { EntityTableComponent, EntityTableTemplate } from '@igo2/common/entity';
import {
  DataSourceService,
  FeatureDataSourceOptions,
  FeatureMotion,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  IgoMap,
  LayerService,
  MAP_DIRECTIVES,
  MapViewOptions,
  OSMDataSourceOptions,
  VectorLayer
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MAP_DIRECTIVES,
    EntityTableComponent
  ]
})
export class AppFeatureComponent implements OnInit, OnDestroy {
  public map: IgoMap = new IgoMap({
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

  public tableTemplate: EntityTableTemplate = {
    selection: true,
    selectMany: true,
    sort: true,
    columns: [
      {
        name: 'properties.id',
        title: 'ID'
      },
      {
        name: 'properties.name',
        title: 'Name'
      },
      {
        name: 'properties.description',
        title: 'Description'
      }
    ]
  };

  public store: FeatureStore = new FeatureStore([], { map: this.map });

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {}

  ngOnInit(): void {
    const loadingStrategy: FeatureStoreLoadingStrategy =
      new FeatureStoreLoadingStrategy({});
    this.store.addStrategy(loadingStrategy);

    const selectionStrategy: FeatureStoreSelectionStrategy =
      new FeatureStoreSelectionStrategy({
        map: this.map,
        motion: FeatureMotion.Default
      });
    this.store.addStrategy(selectionStrategy);

    this.store.load([
      {
        meta: { id: 1 },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-72, 47.8]
        },
        projection: 'EPSG:4326',
        properties: {
          id: 1,
          name: 'Name 1',
          description: 'Description 1'
        }
      },
      {
        meta: { id: 4 },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-71, 46.8]
        },
        projection: 'EPSG:4326',
        properties: {
          id: 4,
          name: 'Name 4',
          description: 'Description 4'
        }
      },
      {
        meta: { id: 5 },
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-73, 45.8]
        },
        projection: 'EPSG:4326',
        properties: {
          id: 5,
          name: 'Name 5',
          description: 'Description 5'
        }
      },
      {
        meta: { id: 2 },
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-72, 47.8],
            [-73.5, 47.4],
            [-72.4, 48.6]
          ]
        },
        projection: 'EPSG:4326',
        properties: {
          id: 2,
          name: 'Name 2',
          description: 'Description 2'
        }
      },
      {
        meta: { id: 3 },
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-71, 46.8],
              [-73, 47],
              [-71.2, 46.6]
            ]
          ]
        },
        projection: 'EPSG:4326',
        properties: {
          id: 3,
          name: 'Name 3',
          description: 'Description 3'
        }
      }
    ]);

    this.layerService
      .createAsyncLayer({
        title: 'OSM',
        baseLayer: true,
        visible: true,
        sourceOptions: {
          type: 'osm'
        } satisfies OSMDataSourceOptions
      })
      .subscribe((layer) => {
        this.map.layerController.add(layer);
      });

    this.layerService
      .createAsyncLayer({
        title: 'Vector Layer',
        sourceOptions: {
          type: 'vector'
        } satisfies FeatureDataSourceOptions,
        animation: {
          duration: 2000
        },
        igoStyle: {
          mapboxStyle: {
            url: 'assets/mapboxStyleExample-feature.json',
            source: 'source_nameX'
          }
        }
      })
      .subscribe((layer: VectorLayer) => {
        this.map.layerController.add(layer);
        this.store.bindLayer(layer);
        loadingStrategy.activate();
        selectionStrategy.activate();
      });
  }

  ngOnDestroy(): void {
    this.store.destroy();
  }
}
