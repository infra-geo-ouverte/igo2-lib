import { Component, OnInit, OnDestroy } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  VectorLayer,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  FeatureMotion
} from '@igo2/geo';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss']
})
export class AppFeatureComponent implements OnInit, OnDestroy {

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

  public tableTemplate = {
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

  public store = new FeatureStore([], {map: this.map});

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {}

  ngOnInit() {
    const loadingStrategy = new FeatureStoreLoadingStrategy({});
    this.store.addStrategy(loadingStrategy);

    const selectionStrategy = new FeatureStoreSelectionStrategy({
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
          coordinates: [[
            [-71, 46.8],
            [-73, 47],
            [-71.2, 46.6]
          ]]
        },
        projection: 'EPSG:4326',
        properties: {
          id: 3,
          name: 'Name 3',
          description: 'Description 3'
        }
      }
    ]);

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
        const layer = this.layerService.createLayer({
          title: 'Vector Layer',
          source: dataSource
        }) as VectorLayer;
        this.map.addLayer(layer);
        this.store.bindLayer(layer);
        loadingStrategy.activate();
        selectionStrategy.activate();
      });
  }

  ngOnDestroy() {
    this.store.destroy();
  }

}
