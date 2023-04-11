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
  XYZDataSourceOptions,
  WMSDataSourceOptions,
  ArcGISRestDataSourceOptions,
  TileArcGISRestDataSourceOptions,
  ArcGISRestImageDataSourceOptions
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
        let wmsParams: string;
        let wmtsParams: string;
        let argisrestParams: string;
        let tilearcgisrestParams: string;
        let xyzParams: string;
        let imagearcgisrestParams: string;

        switch (layer.dataSource.options.type){
          case 'wms':
            const wmsDataSource = layer.dataSource.options as WMSDataSourceOptions;
            const wmsLayerName: string = wmsDataSource.params.LAYERS;
            const wmsUrl: string = wmsDataSource.url;
            wmsParams = 'nom de la couche:'+' '+ wmsLayerName +','+' '+'url:'+' '+ wmsUrl ;
            break;
         case 'wmts':
            const wmtsDataSource = layer.dataSource.options as WMTSDataSourceOptions;
            const wmtsLayerName: string = wmtsDataSource.layer;
            const wmtsUrl: string = wmtsDataSource.url;
            const wmtsMatrixSet: string = wmtsDataSource.matrixSet;
            wmtsParams = 'nom de la couche:' + ' ' + wmtsLayerName + ',' + ' ' + 'url:' + ' '
            wmtsUrl + ',' + ' ' + 'référence spatiale:' + ' ' + wmtsDataSource.matrixSet;
            break;
          case 'arcgisrest':
          case 'tilearcgisrest':
          case 'imagearcgisrest':
            const restDataSource = layer.dataSource.options as ArcGISRestDataSourceOptions |
              TileArcGISRestDataSourceOptions | ArcGISRestImageDataSourceOptions;
            const arcgisrestName: string = restDataSource._layerOptionsFromSource.title;
            const arcgisrestUrl: string = restDataSource.url;
            const tilearcgisrestName: string = restDataSource._layerOptionsFromSource.title;
            const tilearcgisrestUrl: string = restDataSource.url;
            const imagearcgisrestName: string = restDataSource._layerOptionsFromSource.title;
            const imagearcgisrestUrl: string = restDataSource.url;
            argisrestParams = 'nom de la couche:' + ' ' + arcgisrestName || tilearcgisrestName || imagearcgisrestName +
              ',' + ' ' + 'url:' + ' ' + arcgisrestUrl || tilearcgisrestUrl || imagearcgisrestUrl;
            break;
          case 'xyz':
            const xyzDataSource = layer.dataSource.options as XYZDataSourceOptions;
            const xyzName: string = layer.title;
            const xyzUrl: string = xyzDataSource.url;
            xyzParams = 'nom de la couche:'+' '+xyzName +','+' '+'url:'+' '+xyzUrl;
            break;


        }
        this.analyticsService.trackLayer('layer', 'addLayer', layer.dataSource.options.type,
          wmsParams || wmtsParams || argisrestParams || tilearcgisrestParams || xyzParams || imagearcgisrestParams);
      });
    });
  }
}
