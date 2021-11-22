import { Component } from '@angular/core';

import { LanguageService, MediaService } from '@igo2/core';
import { IgoMap, DataSourceService, LayerService, WFSDataSourceOptions, VectorLayerOptions, WFSDataSource } from '@igo2/geo';

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
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private mediaService: MediaService
  ) {

    this.dataSourceService
    .createAsyncDataSource({
      type: 'wmts',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/carto/wmts/1.0.0/wmts',
      layer: 'carte_gouv_qc_public',
      matrixSet: 'EPSG_3857',
      version: '1.3.0'
    })
    .subscribe(dataSource => {
      this.map.addLayer(
        this.layerService.createLayer({
          title: 'Quebec',
          visible: true,
          baseLayer: true,
          source: dataSource
        })
      );
    });

    interface WFSDataOptions
      extends WFSDataSourceOptions {}

    const wfsDatasourcePolygon: WFSDataOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
      params: {
        featureTypes: 'adn_bassin_n1_public_v',
        fieldNameGeometry: 'geometry',
        maxFeatures: 10000,
        version: '3.0.0',
        outputFormat: undefined,
        outputFormatDownload: 'shp'
      }
    };

    this.dataSourceService
      .createAsyncDataSource(wfsDatasourcePolygon)
      .subscribe((dataSource: WFSDataSource) => {
        const layer: VectorLayerOptions = {
          title: 'WFS (polygon)',
          visible: true,
          source: dataSource
        };
        this.map.addLayer(this.layerService.createLayer(layer));
      });

    const wfsDatasourcePoint: WFSDataOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
      params: {
        featureTypes: 'CASERNE',
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
        const layer: VectorLayerOptions = {
          title: 'WFS (point)',
          visible: true,
          source: dataSource,
          styleByAttribute: {
            attribute: 'en_caserne',
            data: ['true', 'false'],
            stroke: ['red', 'blue'],
            fill: ['#ffffff', '#ffffff'],
            radius: [7, 7],
            width: [2, 2],
            // uncomment for labelling
            // label : 'Caserne: ${nom_service_incendie}',
            hoverStyle: {
                attribute: 'nom_service_incendie',
                data: [/.+ Saint-.+/, /.+ Sainte-.+/, /.+/],
                stroke: ['yellow', 'green', 'black'],
                fill: ['#ffffff', '#ffffff', '#ffffff'],
                radius: [15, 12, 15],
                width: [5, 8, 9],
                label: {
                  textAlign: 'left',
                  textBaseline: 'bottom',
                  text: 'Caserne: ${nom_service_incendie} \n Mun: ${ville}',
                  font: '12px Calibri,sans-serif',
                  fill: { color: '#000' },
                  backgroundFill: { color: 'rgba(255, 255, 255, 0.5)' },
                  backgroundStroke: { color: 'rgba(200, 200, 200, 0.75)', width: 2 },
                  stroke: { color: '#fff', width: 3 },
                  overflow: true,
                  offsetX: 10,
                  offsetY: -10,
                  padding: [2.5, 2.5, 2.5, 2.5]
                },
                baseStyle: {
                  circle: {
                    stroke: {
                      color: 'orange',
                      width: 5
                    },
                    width: [5],
                    radius: 15
                  }
                }
            }
          }
        };
        this.map.addLayer(this.layerService.createLayer(layer));
      });

  }
}
