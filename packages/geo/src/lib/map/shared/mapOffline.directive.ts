import { Directive, AfterViewInit } from '@angular/core';
import { NetworkService, ConnectionState } from '@igo2/core';

import { IgoMap } from './map';
import { MapBrowserComponent } from '../map-browser/map-browser.component';
import { FeatureDataSourceOptions } from '../../datasource/shared/datasources/feature-datasource.interface';
import { XYZDataSourceOptions } from '../../datasource/shared/datasources/xyz-datasource.interface';
import { MVTDataSourceOptions } from '../../datasource/shared/datasources/mvt-datasource.interface';
import { ClusterDataSourceOptions } from '../../datasource/shared/datasources/cluster-datasource.interface';
import { Layer } from '../../layer/shared/layers/layer';

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
    private networkService: NetworkService
    ) {
      this.component = component;
    }

  ngAfterViewInit() {
    this.map.offlineButtonToggle$.subscribe((offlineButtonToggle: boolean) => {
      this.offlineButtonStatus = offlineButtonToggle;
      if (this.offlineButtonStatus && this.networkState.connection) {
        this.offlineButtonState.connection = false;
        this.changeLayer();
      } else if (!this.offlineButtonStatus && !this.networkState.connection) {
        this.offlineButtonState.connection = false;
        this.changeLayer();
      } else if (!this.offlineButtonStatus && this.networkState.connection) {
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
      if (layer.options.sourceOptions.type === 'mvt') {
        sourceOptions = (layer.options.sourceOptions as MVTDataSourceOptions);
        layer.ol.getSource().clear();
      } else if (layer.options.sourceOptions.type === 'xyz') {
        sourceOptions = (layer.options.sourceOptions as XYZDataSourceOptions);
      } else if (layer.options.sourceOptions.type === 'vector') {
        sourceOptions = (layer.options.sourceOptions as FeatureDataSourceOptions);
      } else if (layer.options.sourceOptions.type === 'cluster') {
        sourceOptions = (layer.options.sourceOptions as ClusterDataSourceOptions);
      } else {
        if (this.networkState.connection === false || this.offlineButtonState.connection === false) {
          layer.ol.setMaxResolution(0);
          return;
        } else if (this.networkState.connection === true || this.offlineButtonState.connection === true) {
          layer.ol.setMaxResolution(Infinity);
          return;
        }
      }

      if (sourceOptions.pathOffline && this.networkState.connection === false ||
        sourceOptions.pathOffline && this.offlineButtonState.connection === false) {
          if (sourceOptions.type === 'vector' || sourceOptions.type === 'cluster') {
            return;
          }
          layer.ol.getSource().setUrl(sourceOptions.pathOffline);
      } else if (sourceOptions.pathOffline && this.networkState.connection === false ||
        sourceOptions.pathOffline && this.offlineButtonState.connection === true) {
          if (sourceOptions.type === 'vector' || sourceOptions.type === 'cluster') {
            return;
          }
          layer.ol.getSource().setUrl(sourceOptions.url);
      } else {
        if (this.networkState.connection === false || this.offlineButtonState.connection === false) {
          layer.ol.setMaxResolution(0);
        } else if (this.networkState.connection === true || this.offlineButtonState.connection === true) {
          layer.ol.setMaxResolution(Infinity);
        }
      }
    });
  }
}
