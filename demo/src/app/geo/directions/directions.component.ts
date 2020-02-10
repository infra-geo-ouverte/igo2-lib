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

  public stopsStore = new FeatureStore<Feature>([], {map: this.map});
  public routeStore = new FeatureStore<Feature>([], {map: this.map});

  constructor(
    private projectionService: ProjectionService,
    private languageService: LanguageService,
    private layerService: LayerService,
    private mapService: MapService
  ) {
    this.mapService.setMap(this.map);
    this.layerService
      .createAsyncLayer({
        title: 'Quebec Base Map',
        sourceOptions: {
          type: 'wmts',
          url: 'https://geoegl.msp.gouv.qc.ca/carto/wmts/1.0.0/wmts',
          layer: 'carte_gouv_qc_ro',
          matrixSet: 'EPSG_3857',
          version: '1.3.0'
        }
      })
      .subscribe(l => this.map.addLayer(l));
  }
}
