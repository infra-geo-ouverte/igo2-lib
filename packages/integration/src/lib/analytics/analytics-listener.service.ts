import { Injectable, inject } from '@angular/core';

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
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);
  private contextState = inject(ContextState);
  private toolState = inject(ToolState);
  private mapState = inject(MapState);

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
        const eventName = context.id?.toString() ?? context.uri;
        this.analyticsService.trackEvent(
          'context',
          'activateContext',
          eventName!
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
        let wmsParams: string | undefined;
        let wmtsParams: string | undefined;
        let restParams: string | undefined;

        if (isLayerGroup(layer)) {
          return;
        }

        switch (layer.dataSource.options.type) {
          case 'wms': {
            const wmsDataSource = layer.dataSource
              .options as WMSDataSourceOptions;
            const wmsLayerName: string = wmsDataSource.params.LAYERS;
            const wmsUrl: string = wmsDataSource.url;
            const wmsType = wmsDataSource.type;
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
            const wmtsUrl = wmtsDataSource.url;
            const matrixSet = wmtsDataSource.matrixSet;
            const wmtsType = wmtsDataSource.type;
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
            const restName = restDataSource.layer;
            const restUrl = restDataSource.url;
            const restType = restDataSource.type;
            restParams = JSON.stringify({
              layer: restName,
              type: restType,
              url: restUrl
            });
            break;
          }
        }
        const eventName = wmsParams || wmtsParams || restParams;
        this.analyticsService.trackLayer('layer', 'addLayer', eventName!);
      });
    });
  }
}
