import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { IgoMap, LayerService, MeasureService } from '@igo2/geo';

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.scss']
})
export class AppMeasureComponent {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 9
  };

  constructor(
    private languageService: LanguageService,
    private layerService: LayerService,
    private measureService: MeasureService
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
  setMesurementType($event) {
    this.measureService.setMesurementType($event.value);
  }
  setUnits($event) {
    this.measureService.setUnits($event.value);
  }
}
