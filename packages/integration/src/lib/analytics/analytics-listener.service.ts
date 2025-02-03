import { Injectable } from '@angular/core';

import { AuthService } from '@igo2/auth';
import { AnalyticsService } from '@igo2/core/analytics';
import {
  ArcGISRestDataSourceOptions,
  ArcGISRestImageDataSourceOptions,
  TileArcGISRestDataSourceOptions,
  WMSDataSourceOptions,
  WMTSDataSourceOptions,
  isLayerGroup
} from '@igo2/geo';

import { skip } from 'rxjs/operators';

import { ContextState } from '../context/context.state';
import { MapState } from '../map/map.state';
import { ToolState } from '../tool/tool.state';

/**
 * Service that holds the state of the search module
 */
@Injectable({
  providedIn: 'root'
})
export class AnalyticsListenerService {
  /**
   * Toolbox that holds main tools
   */

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private contextState: ContextState,
    private toolState: ToolState,
    private mapState: MapState
  ) {}

  listen() {
    this.listenUser();
    this.listenContext();
    this.listenTool();
    this.listenLayer();
  }

  listenUser() {
    this.authService.authenticate$.subscribe(() => {
      const tokenDecoded = this.authService.decodeToken();
      if (tokenDecoded?.user) {
        this.authService
          .getProfils()
          .subscribe((profils) =>
            this.analyticsService.setUser(tokenDecoded.user, profils.profils)
          );
      } else {
        this.analyticsService.setUser(null);
      }
    });
  }

  listenContext() {
    this.contextState.context$.subscribe((context) => {
      if (context) {
        this.analyticsService.trackEvent(
          'context',
          'activateContext',
          context.id || context.uri
        );
      }
    });
  }

  listenTool() {
    this.toolState.toolbox.activeTool$.pipe(skip(1)).subscribe((tool) => {
      if (tool) {
        this.analyticsService.trackEvent('tool', 'activateTool', tool.name);
      }
    });
  }

  /**
   * Listener for adding layers to the map
   */
  listenLayer() {
    this.mapState.map.layersAddedByClick$.subscribe((layers) => {
      if (!layers) {
        return;
      }

      layers.forEach((layer) => {
        let wmsParams: string;
        let wmtsParams: string;
        let xyzParams: string;
        let restParams: string;

        if (isLayerGroup(layer)) {
          return;
        }

        switch (layer.dataSource.options.type) {
          case 'wms': {
            const wmsDataSource = layer.dataSource
              .options as WMSDataSourceOptions;
            const wmsLayerName: string = wmsDataSource.params.LAYERS;
            const wmsUrl: string = wmsDataSource.url;
            const wmsType: string = wmsDataSource.type;
            wmsParams = JSON.stringify({
              layer: wmsLayerName,
              type: wmsType,
              url: wmsUrl
            });
            break;
          }
          case 'wmts': {
            const wmtsDataSource = layer.dataSource
              .options as WMTSDataSourceOptions;
            const wmtsLayerName: string = wmtsDataSource.layer;
            const wmtsUrl: string = wmtsDataSource.url;
            const matrixSet: string = wmtsDataSource.matrixSet;
            const wmtsType: string = wmtsDataSource.type;
            wmtsParams = JSON.stringify({
              layer: wmtsLayerName,
              type: wmtsType,
              url: wmtsUrl,
              matrixSet
            });
            break;
          }
          case 'arcgisrest':
          case 'tilearcgisrest':
          case 'imagearcgisrest': {
            const restDataSource = layer.options.sourceOptions as
              | ArcGISRestDataSourceOptions
              | TileArcGISRestDataSourceOptions
              | ArcGISRestImageDataSourceOptions;
            const restName: string = restDataSource.layer;
            const restUrl: string = restDataSource.url;
            const restType: string = restDataSource.type;
            restParams = JSON.stringify({
              layer: restName,
              type: restType,
              url: restUrl
            });
            break;
          }
          case 'xyz':
            /* const xyzDataSource = layer.dataSource.options as XYZDataSourceOptions;
            const xyzName: string = layer.title;
            const xyzUrl: string = xyzDataSource.url;
            const xyzType: string = layer.dataSource.options.type;
            xyzParams = JSON.stringify({layer: xyzName, type: xyzType, url: xyzUrl});
            */
            // todo
            break;
        }
        this.analyticsService.trackLayer(
          'layer',
          'addLayer',
          wmsParams || wmtsParams || xyzParams || restParams
        );
      });
    });
  }
}
