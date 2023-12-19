import { Component, OnDestroy, OnInit } from '@angular/core';

import { IgoEntityTableModule } from '@igo2/common';
import { LanguageService } from '@igo2/core';
import {
  DataSourceService,
  FeatureMotion,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  IgoMap,
  IgoMapModule,
  LayerService,
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
    IgoMapModule,
    IgoEntityTableModule
  ]
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

  public store = new FeatureStore([], { map: this.map });

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
        title: 'MVT test',
        visible: true,
        sourceOptions: {
          type: 'mvt',
          url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/ne:ne_10m_admin_0_countries@EPSG:900913@pbf/{z}/{x}/{-y}.pbf',
          queryable: true
        },
        igoStyle: {
          mapboxStyle: {
            url: 'assets/mapboxStyleExample-vectortile.json',
            source: 'ahocevar'
          }
        }
      } as any)
      .subscribe((l) => this.map.addLayer(l));

    this.dataSourceService
      .createAsyncDataSource({
        type: 'vector'
      })
      .subscribe((dataSource) => {
        const layer = this.layerService.createLayer({
          title: 'Vector Layer',
          source: dataSource,
          animation: {
            duration: 2000
          },
          igoStyle: {
            mapboxStyle: {
              url: 'assets/mapboxStyleExample-feature.json',
              source: 'source_nameX'
            }
          }
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
