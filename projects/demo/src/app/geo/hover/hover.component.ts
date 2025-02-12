import { Component } from '@angular/core';

import { Media, MediaService } from '@igo2/core/media';
import {
  DataSourceService,
  IgoMap,
  IgoMapModule,
  LayerService,
  MapViewOptions,
  TileLayer,
  TileLayerOptions,
  VectorLayerOptions,
  WFSDataSource,
  WFSDataSourceOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-hover',
  templateUrl: './hover.component.html',
  styleUrls: ['./hover.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, IgoMapModule]
})
export class AppHoverComponent {
  public pointerCoordDelay = 0;
  public pointerHoverFeatureDelay = 0;
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 8,
    projection: 'EPSG:3857'
  };

  get media(): Media {
    return this.mediaService.getMedia();
  }

  get isTouchScreen(): boolean {
    return this.mediaService.isTouchScreen();
  }

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private mediaService: MediaService
  ) {
    this.layerService
      .createAsyncLayer({
        title: 'Quebec Base Map',
        baseLayer: true,
        visible: true,
        sourceOptions: {
          type: 'xyz',
          url: 'https://geoegl.msp.gouv.qc.ca/carto/tms/1.0.0/carte_gouv_qc_public@EPSG_3857/{z}/{x}/{-y}.png'
        }
      } satisfies TileLayerOptions)
      .subscribe((layer: TileLayer) => this.map.layerController.add(layer));

    const wfsDatasourcePoint: WFSDataSourceOptions = {
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
        this.map.layerController.add(
          this.layerService.createLayer(layerOptions)
        );
      });
  }
}
