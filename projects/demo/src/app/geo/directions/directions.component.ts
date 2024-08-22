import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { AuthService } from '@igo2/auth';
import {
  DirectionsComponent,
  IgoMap,
  LayerService,
  MAP_DIRECTIVES,
  MapService,
  MapViewOptions,
  RoutesFeatureStore,
  StepFeatureStore,
  StopsFeatureStore,
  StopsStore,
  TileLayer,
  TileLayerOptions,
  provideDirection,
  provideSearch,
  withIChercheSource,
  withOsrmSource
} from '@igo2/geo';

import { BehaviorSubject, Subject } from 'rxjs';

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
    MAP_DIRECTIVES,
    DirectionsComponent
  ],
  providers: [
    provideDirection(withOsrmSource()),
    provideSearch([withIChercheSource()])
  ]
})
export class AppDirectionsComponent {
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
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

  public authenticated$: BehaviorSubject<boolean>;

  constructor(
    private layerService: LayerService,
    private mapService: MapService,
    private authService: AuthService
  ) {
    this.authenticated$ = this.authService.authenticate$;
    this.mapService.setMap(this.map);
    this.layerService
      .createAsyncLayer({
        title: 'Quebec Base Map',
        baseLayer: true,
        visible: true,
        sourceOptions: {
          type: 'xyz',
          url: '/carto/tms/1.0.0/carte_gouv_qc_public@EPSG_3857/{z}/{x}/{-y}.png',
          crossOrigin: 'anonymous'
        }
      } satisfies TileLayerOptions)
      .subscribe((layer: TileLayer) => this.map.addLayer(layer));
  }
}
