import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { IgoMap, LayerService } from '@igo2/geo';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class AppPrintComponent {
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
    private layerService: LayerService
  ) {
    this.layerService
      .createAsyncLayer({
        title: 'Quebec Base Map',
        sourceOptions: {
          type: 'wmts',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/carto/wmts/1.0.0/wmts',
          layer: 'carte_gouv_qc_ro',
          matrixSet: 'EPSG_3857',
          version: '1.3.0',
          crossOrigin: 'anonymous'
        }
      })
      .subscribe(l => this.map.addLayer(l));

    this.layerService
      .createAsyncLayer({
        title: 'School board',
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
          params: {
            layers: 'MELS_CS_ANGLO_S',
            version: '1.3.0'
          },
          crossOrigin: 'anonymous'
        }
      })
      .subscribe(l => this.map.addLayer(l));
    //
    this.layerService
      .createAsyncLayer({
        title: 'Embacle',
        sourceOptions: {
          type: 'wms',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
          params: {
            layers: 'vg_observation_v_inondation_embacle_wmst',
            version: '1.3.0'
          },
          crossOrigin: 'anonymous'
        }
      })
      .subscribe(l => this.map.addLayer(l));

    // this.layerService
    //   .createAsyncLayer({
    //     title: 'Geomet',
    //     sourceOptions: {
    //       type: 'wms',
    //       url: 'http://geo.weather.gc.ca/geomet/?lang=fr',
    //       params: {
    //         layers: 'RADAR_1KM_RDBR',
    //         version: '1.3.0'
    //       },
    //       crossOrigin: 'anonymous'
    //     }
    //   })
    //   .subscribe(l => this.map.addLayer(l));

    /*
        //CORS error if activate (for test)
        this.layerService
          .createAsyncLayer({
            title: 'Geomet',
            sourceOptions: {
              type: 'wms',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/swtq?service=wms',
              params: {
                layers: 'swtq',
                version: '1.3.0',
              }
            }
          })
          .subscribe(l => this.map.addLayer(l));
    */
  }
}
