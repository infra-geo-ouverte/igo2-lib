import { Directive, AfterViewInit } from '@angular/core';
import {
  NetworkService,
  ConnectionState,
  MessageService
} from '@igo2/core';

import { IgoMap } from './map';
import { MapBrowserComponent } from '../map-browser/map-browser.component';
import { FeatureDataSourceOptions } from '../../datasource/shared/datasources/feature-datasource.interface';
import { XYZDataSourceOptions } from '../../datasource/shared/datasources/xyz-datasource.interface';
import { MVTDataSourceOptions } from '../../datasource/shared/datasources/mvt-datasource.interface';
import { ClusterDataSourceOptions } from '../../datasource/shared/datasources/cluster-datasource.interface';
import { Layer } from '../../layer/shared/layers/layer';
import { ClusterDataSource } from '../../datasource/shared/datasources/cluster-datasource';
import { MVTDataSource } from '../../datasource/shared/datasources/mvt-datasource';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { XYZDataSource } from '../../datasource/shared/datasources/xyz-datasource';

@Directive({
  selector: '[igoMapOffline]'
})
export class MapOfflineDirective implements AfterViewInit {
  private component: MapBrowserComponent;
  private offlineButtonStatus: boolean = false;
  private networkState: ConnectionState = {
    connection: true
  };
  private offlineButtonState: ConnectionState = {
    connection: true
  };

  get map(): IgoMap {
    return this.component.map;
  }

  private previousMessageId;

  constructor(
    component: MapBrowserComponent,
    private networkService: NetworkService,
    private messageService: MessageService
  ) {
    this.component = component;
  }

  ngAfterViewInit() {
    const initial = window.navigator.onLine;
    this.map.offlineButtonToggle$.subscribe((offlineButtonToggle: boolean) => {
      if (this.previousMessageId) {
        this.messageService.remove(this.previousMessageId);
      }
      this.offlineButtonStatus = offlineButtonToggle;
      if (this.offlineButtonStatus && this.networkState.connection) {
        const messageObj = this.messageService.info(
          'igo.geo.network.offline.message',
          'igo.geo.network.offline.title');
        this.previousMessageId = messageObj.toastId;
        this.offlineButtonState.connection = false;
        this.changeLayer();
      } else if (!this.offlineButtonStatus && !this.networkState.connection) {
        const messageObj = this.messageService.info(
          'igo.geo.network.offline.message',
          'igo.geo.network.offline.title');
        this.previousMessageId = messageObj.toastId;
        this.offlineButtonState.connection = false;
        this.changeLayer();
      } else if (!this.offlineButtonStatus && this.networkState.connection && this.networkState.connection !== initial) {
        const messageObj = this.messageService.info(
          'igo.geo.network.online.message',
          'igo.geo.network.online.title');
        this.previousMessageId = messageObj.toastId;
        this.offlineButtonState.connection = true;
        this.changeLayer();
      }
    });

    this.networkService.currentState().subscribe((state: ConnectionState) => {
      this.networkState = state;
      if (!this.offlineButtonStatus) {
        this.changeLayer();
      }
    });

    this.map.layers$.subscribe((layers: Layer[]) => {
      this.changeLayer();
    });
  }

  private changeLayer() {
    let sourceOptions;
    const layerList = this.map.layers$.value;
    layerList.forEach(layer => {
      if (layer.isIgoInternalLayer) {
        return;
      }
      if (layer.options.source instanceof MVTDataSource) {
        sourceOptions = layer.options.sourceOptions as MVTDataSourceOptions;
        layer.ol.getSource().refresh();
      } else if (layer.options.source instanceof XYZDataSource) {
        sourceOptions = layer.options.sourceOptions as XYZDataSourceOptions;
      } else if (layer.options.source instanceof ClusterDataSource) {
        sourceOptions = layer.options.sourceOptions as ClusterDataSourceOptions;
      } else if (layer.options.source instanceof FeatureDataSource) {
        sourceOptions = layer.options.sourceOptions as FeatureDataSourceOptions;
      } else {
        if (
          this.networkState.connection === false ||
          this.offlineButtonState.connection === false
        ) {
          layer.maxResolution = 0;
          return;
        } else if (
          this.networkState.connection === true ||
          this.offlineButtonState.connection === true
        ) {
          layer.maxResolution = layer.options.maxResolution || Infinity;
          return;
        }
      }

      if (sourceOptions) {
        if (
          (sourceOptions.pathOffline &&
            this.networkState.connection === false) ||
          (sourceOptions.pathOffline &&
            this.offlineButtonState.connection === false)
        ) {
          if (
            sourceOptions.type === 'vector' ||
            sourceOptions.type === 'cluster'
          ) {
            return;
          }
          (layer.ol.getSource() as any).setUrl(sourceOptions.pathOffline);
        } else if (
          (sourceOptions.pathOffline &&
            this.networkState.connection === false) ||
          (sourceOptions.pathOffline &&
            this.offlineButtonState.connection === true)
        ) {
          if (
            sourceOptions.type === 'vector' ||
            sourceOptions.type === 'cluster'
          ) {
            return;
          }
          (layer.ol.getSource() as any).setUrl(sourceOptions.url);
        } else {
          if (
            this.networkState.connection === false ||
            this.offlineButtonState.connection === false
          ) {
            layer.maxResolution = 0;
          } else if (
            this.networkState.connection === true ||
            this.offlineButtonState.connection === true
          ) {
            layer.maxResolution = layer.options.maxResolution || Infinity;
          }
        }
      } else {
        if (
          this.networkState.connection === false ||
          this.offlineButtonState.connection === false
        ) {
          layer.maxResolution = 0;
        } else if (
          this.networkState.connection === true ||
          this.offlineButtonState.connection === true
        ) {
          layer.maxResolution = layer.options.maxResolution || Infinity;
        }
      }
    });
  }
}
