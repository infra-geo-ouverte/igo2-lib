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
  public pointerHoverFeatureDelay = 100;
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
          style: [
            {
              filter: ['==', ['get', '_hovered'], true],
              style: {
                'circle-radius': 12,
                'circle-stroke-width': 5,
                'circle-stroke-color': '#f2a100',
                'text-value': [
                  'concat',
                  'Caserne: ',
                  ['case', ['has', 'no_caserne'], ['get', 'no_caserne'], ''],
                  '\nMun: ',
                  ['case', ['has', 'nom_ssi'], ['get', 'nom_ssi'], '']
                ],
                'text-font': '12px sans-serif',
                'text-fill-color': '#111111',
                'text-stroke-width': 0,
                'text-background-fill-color': '#ffffff',
                'text-background-stroke-color': '#c8c8c8',
                'text-background-stroke-width': 1,
                'text-padding': [4, 6, 4, 6],
                'text-align': 'left',
                'text-offset-x': 30
              }
            },
            {
              else: true,
              style: {
                'circle-radius': 5,
                'circle-fill-color': 'blue',
                'circle-stroke-width': 2,
                'circle-stroke-color': 'white',
                'text-fill-color': 'black',
                'text-offset-y': -15
              }
            }
          ]
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
        const rtssGeostylerStyle = {
          type: 'Geostyler',
          style: {
            name: 'RTSS hover style',
            rules: [
              {
                name: 'Hovered RTSS',
                filter: ['==', '_hovered', true],
                symbolizers: [
                  {
                    kind: 'Line',
                    color: '#f2a100',
                    width: 5
                  },
                  {
                    kind: 'Text',
                    label: 'RTSS: {{num_rts}}',
                    color: '#111111',
                    haloColor: '#ffffff',
                    haloWidth: 2,
                    font: ['sans-serif'],
                    size: 12,
                    offset: [0, -14]
                  }
                ]
              },
              {
                name: 'Default RTSS',
                symbolizers: [
                  {
                    kind: 'Line',
                    color: '#2b7fff',
                    width: 2
                  }
                ]
              }
            ]
          }
        };

        const layerOptions: VectorTileLayerOptions = {
          title: 'RTSS',
          visible: true,
          source: dataSource,
          style: rtssGeostylerStyle
        };
        this.map.layerController.add(
          this.layerService.createLayer(layerOptions)
        );
      });
  }
}
