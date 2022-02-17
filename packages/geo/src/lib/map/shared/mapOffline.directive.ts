import { Directive, AfterViewInit } from '@angular/core';
import {
  NetworkService,
  ConnectionState,
  MessageService,
  LanguageService
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

  constructor(
    component: MapBrowserComponent,
    private networkService: NetworkService,
    private messageService: MessageService,
    private languageService: LanguageService
  ) {
    this.component = component;
  }

  ngAfterViewInit() {
    this.map.offlineButtonToggle$.subscribe((offlineButtonToggle: boolean) => {
      this.offlineButtonStatus = offlineButtonToggle;
      const translate = this.languageService.translate;
      if (this.offlineButtonStatus && this.networkState.connection) {
        const message = translate.instant('igo.geo.network.offline.message');
        const title = translate.instant('igo.geo.network.offline.title');
        this.messageService.info(message, title);
        this.offlineButtonState.connection = false;
        this.changeLayer();
      } else if (!this.offlineButtonStatus && !this.networkState.connection) {
        const message = translate.instant('igo.geo.network.offline.message');
        const title = translate.instant('igo.geo.network.offline.title');
        this.messageService.info(message, title);
        this.offlineButtonState.connection = false;
        this.changeLayer();
      } else if (!this.offlineButtonStatus && this.networkState.connection) {
        let message;
        let title;
        const messageObs = translate.get('igo.geo.network.online.message');
        const titleObs = translate.get('igo.geo.network.online.title');
        messageObs.subscribe((message1: string) => {
          message = message1;
        });
        titleObs.subscribe((title1: string) => {
          title = title1;
        });
        this.messageService.info(message, title);
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
          layer.ol.setMaxResolution(0);
          return;
        } else if (
          this.networkState.connection === true ||
          this.offlineButtonState.connection === true
        ) {
          layer.ol.setMaxResolution(Infinity);
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
          // layer.ol.getSource().setUrl(sourceOptions.pathOffline);
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
          // layer.ol.getSource().setUrl(sourceOptions.url);
        } else {
          if (
            this.networkState.connection === false ||
            this.offlineButtonState.connection === false
          ) {
            layer.ol.setMaxResolution(0);
          } else if (
            this.networkState.connection === true ||
            this.offlineButtonState.connection === true
          ) {
            layer.ol.setMaxResolution(Infinity);
          }
        }
      } else {
        if (
          this.networkState.connection === false ||
          this.offlineButtonState.connection === false
        ) {
          layer.ol.setMaxResolution(0);
        } else if (
          this.networkState.connection === true ||
          this.offlineButtonState.connection === true
        ) {
          layer.ol.setMaxResolution(Infinity);
        }
      }
    });
  }
}
