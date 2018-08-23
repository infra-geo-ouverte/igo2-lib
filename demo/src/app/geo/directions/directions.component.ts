import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { IgoMap, LayerService } from '@igo2/geo';

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

  constructor(
    private languageService: LanguageService,
    private layerService: LayerService
  ) {
    this.layerService
      .createAsyncLayer({
        title: 'Quebec Base Map',
        sourceOptions: {
          type: 'wmts',
          url: '/carto/wmts/1.0.0/wmts',
          layer: 'carte_gouv_qc_ro',
          matrixSet: 'EPSG_3857',
          version: '1.3.0'
        }
      })
      .subscribe(l => this.map.addLayer(l));
  }
}
