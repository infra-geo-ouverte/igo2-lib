import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  LayerService,
  MapService,
  ProjectionService,
  RoutesFeatureStore,
  StepFeatureStore,
  StopsFeatureStore,
  StopsStore
} from '@igo2/geo';

import { Subject } from 'rxjs';

import { IgoDirectionsModule } from '../../../../../../packages/geo/src/lib/directions/directions.module';
import { IgoMapModule } from '../../../../../../packages/geo/src/lib/map/map.module';
import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-directions',
  templateUrl: './directions.component.html',
  styleUrls: ['./directions.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    IgoMapModule,
    IgoDirectionsModule
  ]
})
export class AppDirectionsComponent {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 9,
    geolocate: false
  };

  public stopsStore: StopsStore = new StopsStore([]);
  public stopsFeatureStore: StopsFeatureStore = new StopsFeatureStore([], {
    map: this.map
  });
  public stepFeatureStore: StepFeatureStore = new StepFeatureStore([], {
    map: this.map
  });
  public routesFeatureStore: RoutesFeatureStore = new RoutesFeatureStore([], {
    map: this.map
  });
  public zoomToActiveRoute$: Subject<void> = new Subject();

  constructor(
    private projectionService: ProjectionService,
    private languageService: LanguageService,
    private layerService: LayerService,
    private mapService: MapService
  ) {
    this.mapService.setMap(this.map);
    this.layerService
      .createAsyncLayer({
        title: 'OSM',
        sourceOptions: {
          type: 'osm'
        }
      })
      .subscribe((l) => this.map.addLayer(l));
  }
}
