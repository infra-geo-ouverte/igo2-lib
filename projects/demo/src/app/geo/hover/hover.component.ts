import { Component, inject } from '@angular/core';

import { Media, MediaService } from '@igo2/core/media';
import {
  DataSourceService,
  IgoMap,
  IgoMapModule,
  LayerService,
  MVTDataSource,
  MapViewOptions,
  TileLayer,
  TileLayerOptions,
  VectorLayerOptions,
  VectorTileLayerOptions,
  WFSDataSource,
  WFSDataSourceOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-hover',
  templateUrl: './hover.component.html',
  styleUrls: ['./hover.component.scss'],
  imports: [DocViewerComponent, ExampleViewerComponent, IgoMapModule]
})
export class AppHoverComponent {
  private dataSourceService = inject(DataSourceService);
  private layerService = inject(LayerService);
  private mediaService = inject(MediaService);

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

  constructor() {
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
          hoverAttribute: 'Caserne: ${no_caserne} \nMun: ${nom_ssi}',
          igoStyle: {
            geostylerStyle: {
              global: {
                name: 'Basic Circle',
                rules: [
                  {
                    name: 'Rule 1',
                    symbolizers: [
                      {
                        kind: 'Mark',
                        wellKnownName: 'triangle',
                        radius: 10,
                        strokeColor: '#c21515',
                        strokeWidth: 2
                      }
                    ]
                  }
                ]
              }
            }
          }
        };
        this.map.layerController.add(
          this.layerService.createLayer(layerOptions)
        );
      });
    this.dataSourceService
      .createAsyncDataSource({
        featureClass: 'feature',
        type: 'mvt',
        url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq?mode=tile&tilemode=gmap&tile={x}+{y}+{z}&layers=bgr_v_sous_route_res_sup_act&map.imagetype=mvt'
      })
      .subscribe((dataSource: MVTDataSource) => {
        const layerOptions: VectorTileLayerOptions = {
          title: 'RTSS',
          visible: true,
          source: dataSource,
          hoverAttribute: 'RTSS: ${num_rts}'
        };
        this.map.layerController.add(
          this.layerService.createLayer(layerOptions)
        );
      });
  }
}
