import { Injectable } from '@angular/core';
import { skip } from 'rxjs/operators';

import { AnalyticsService } from '@igo2/core';
import { AuthService } from '@igo2/auth';

import { ContextState } from '../context/context.state';
import { SearchState } from '../search/search.state';
import { ToolState } from '../tool/tool.state';
import { MapState } from '../map/map.state';

import {
  Layer,
  WMTSDataSourceOptions,
  WebSocketDataSourceOptions,
  XYZDataSourceOptions,
  OSMDataSourceOptions,
  ClusterDataSourceOptions,
  WMSDataSourceOptionsParams
} from '@igo2/geo';


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
    private searchState: SearchState,
    private toolState: ToolState,
    private mapState: MapState
  ) {}

  listen() {
    this.listenUser();
    this.listenContext();
    this.listenTool();
    this.listenSearch();
    this.listenLayer();
  }

  listenUser() {
    this.authService.authenticate$.subscribe(() => {
      const tokenDecoded = this.authService.decodeToken() || {};
      if (tokenDecoded.user) {
        this.authService
          .getProfils()
          .subscribe(profils =>
            this.analyticsService.setUser(tokenDecoded.user, profils.profils)
          );
      } else {
        this.analyticsService.setUser();
      }
    });
  }

  listenContext() {
    this.contextState.context$.subscribe(context => {
      if (context) {
        this.analyticsService.trackEvent('context', 'activateContext', context.id || context.uri);
      }
    });
  }

  listenTool() {
    this.toolState.toolbox.activeTool$.pipe(skip(1)).subscribe(tool => {
      if (tool) {
        this.analyticsService.trackEvent('tool', 'activateTool', tool.name);
      }
    });
  }

  listenSearch() {
    this.searchState.searchTerm$.pipe(skip(1)).subscribe((searchTerm: string) => {
      if (searchTerm !== undefined && searchTerm !== null) {
        this.analyticsService.trackSearch(searchTerm, this.searchState.store.count);
      }
    });
  }

  /**
    * Listener for adding layers to the map
    */
  listenLayer(){
    this.mapState.map.layersAddedByClick$.subscribe((layers: Layer[]) => {
      if(!layers){
        return;
      }

      layers.map(layer => {
        switch (layer.dataSource.options.type){
          case 'wms':
            const wmsDataSource = layer.dataSource.options as WMSDataSourceOptionsParams;
            this.analyticsService.trackLayer(layer.dataSource.options.type, wmsDataSource.LAYERS);
            break;
          case 'wmts':
            const wmstDataSource = layer.dataSource.options as WMTSDataSourceOptions;
            this.analyticsService.trackLayer(layer.dataSource.options.type, wmstDataSource.layer, 
              wmstDataSource.url, wmstDataSource.matrixSet);
            break;
          case 'websocket':
            const webSocketDataSource = layer.dataSource.options as WebSocketDataSourceOptions;
            this.analyticsService.trackLayer(layer.dataSource.options.type,
              layer.title, webSocketDataSource.url, webSocketDataSource.onmessage);
            break;
          case 'cluster':
            //type+URL
            const clusterDataSource = layer.dataSource.options as ClusterDataSourceOptions;
            this.analyticsService.trackLayer(layer.dataSource.options.type, layer.title, clusterDataSource.url);
            break;
          case 'xyz':
            //type, url
            const xyzDataSource = layer.dataSource.options as XYZDataSourceOptions;
            this.analyticsService.trackLayer(layer.dataSource.options.type, layer.title, xyzDataSource.url);
            break;
          case 'osm':
            //type
            const osmDataSource = layer.dataSource.options as OSMDataSourceOptions;
            this.analyticsService.trackLayer(layer.dataSource.options.type, layer.title, osmDataSource.url);
            break;
          default:
            //layer+name???
            this.analyticsService.trackLayer(layer.dataSource.options.type, layer.title);
            break;
        }
      });
    });
  }
}
