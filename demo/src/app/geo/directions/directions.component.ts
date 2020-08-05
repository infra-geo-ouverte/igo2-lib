import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  LayerService,
  MapService,
  FeatureStore,
  Feature,
  ProjectionService
} from '@igo2/geo';

@Component({
  selector: 'app-directions',
  templateUrl: './directions.component.html',
  styleUrls: ['./directions.component.scss']
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
    geolocate: true
  };

  public stopsStore = new FeatureStore<Feature>([], { map: this.map });
  public routeStore = new FeatureStore<Feature>([], { map: this.map });

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
      .subscribe(l => this.map.addLayer(l));
  }
}
