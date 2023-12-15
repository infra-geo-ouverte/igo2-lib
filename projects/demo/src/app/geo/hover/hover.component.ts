import { Component } from '@angular/core';

import { MediaService } from '@igo2/core';
import {
  DataSourceService,
  IgoMap,
  Layer,
  LayerService,
  VectorLayerOptions,
  WFSDataSource,
  WFSDataSourceOptions
} from '@igo2/geo';

@Component({
  selector: 'app-hover',
  templateUrl: './hover.component.html',
  styleUrls: ['./hover.component.scss']
})
export class AppHoverComponent {
  public selected;
  public pointerCoord;
  public pointerCoordDelay: number = 0;
  public pointerHoverFeatureDelay: number = 0;
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 8,
    projection: 'EPSG:3857'
  };

  get media() {
    return this.mediaService.getMedia();
  }

  get isTouchScreen() {
    return this.mediaService.isTouchScreen();
  }

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private mediaService: MediaService
  ) {
    // Fond
    this.layerService
      .createAsyncLayer({
        title: 'Quebec Base Map',
        baseLayer: true,
        visible: true,
        sourceOptions: {
          type: 'xyz',
          url: 'https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/carte_gouv_qc_public@EPSG_3857/{z}/{x}/{-y}.png'
        }
      })
      .subscribe((layer: Layer) => this.map.addLayer(layer));

    interface WFSDataOptions extends WFSDataSourceOptions {}

    // Casernes
    const wfsDatasourcePoint: WFSDataOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/all.fcgi',
      params: {
        featureTypes: 'MSP_CASERNE_PUBLIC',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '2.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'shp'
      }
    };

    this.dataSourceService
      .createAsyncDataSource(wfsDatasourcePoint)
      .subscribe((dataSource: WFSDataSource) => {
        const layerOptions: VectorLayerOptions = {
          title: 'Casernes',
          visible: true,
          source: dataSource,
          igoStyle: {
            styleByAttribute: {
              attribute: 'en_caserne',
              data: ['true', 'false'],
              stroke: ['red', 'blue'],
              fill: ['#ffffff', '#ffffff'],
              radius: [7, 7],
              width: [2, 2]
            },
            hoverStyle: {
              label: {
                attribute: 'Caserne: ${no_caserne} \nMun: ${nom_ssi}',
                style: {
                  textAlign: 'left',
                  textBaseline: 'top',
                  font: '12px Calibri,sans-serif',
                  fill: { color: '#000' },
                  backgroundFill: { color: 'rgba(255, 255, 255, 0.5)' },
                  backgroundStroke: {
                    color: 'rgba(200, 200, 200, 0.75)',
                    width: 2
                  },
                  stroke: { color: '#fff', width: 3 },
                  overflow: true,
                  offsetX: 20,
                  offsetY: 10,
                  padding: [2.5, 2.5, 2.5, 2.5]
                }
              },
              baseStyle: {
                circle: {
                  stroke: {
                    color: 'orange',
                    width: 5
                  },
                  radius: 15
                }
              }
            }
          }
        };
        this.map.addLayer(this.layerService.createLayer(layerOptions));
      });
  }
}
