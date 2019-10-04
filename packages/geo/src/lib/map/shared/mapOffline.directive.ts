import { Directive, AfterViewInit } from '@angular/core';
import { NetworkService, ConnectionState } from '@igo2/core';

import { IgoMap } from './map';
import { MapBrowserComponent } from '../map-browser/map-browser.component';
import { FeatureDataSourceOptions } from '../../datasource/shared/datasources/feature-datasource.interface';
import { XYZDataSourceOptions } from '../../datasource/shared/datasources/xyz-datasource.interface';
import { MVTDataSourceOptions } from '../../datasource/shared/datasources/mvt-datasource.interface';
import { ClusterDataSourceOptions } from '../../datasource/shared/datasources/cluster-datasource.interface';

@Directive({
    selector: '[igoMapOffline]'
  })
export class MapOfflineDirective implements AfterViewInit {

  private state: ConnectionState;
  private component: MapBrowserComponent;

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
    this.networkService.currentState().subscribe((state: ConnectionState) => {
      this.state = state;
      this.changeLayer();
    });

    this.map.layers$.subscribe(() => {
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
        if (this.state.connection === false) {
          layer.ol.setMaxResolution(0);
          return;
        } else if (this.state.connection === true) {
          layer.ol.setMaxResolution(Infinity);
          return;
        }
      }

      if (sourceOptions.pathOffline  &&
        this.state.connection === false) {
          if (sourceOptions.type === 'vector' || sourceOptions.type === 'cluster') {
            return;
          }
          layer.ol.getSource().setUrl(sourceOptions.pathOffline);
      } else if (sourceOptions.pathOffline &&
        this.state.connection === true) {
          if (sourceOptions.type === 'vector' || sourceOptions.type === 'cluster') {
            return;
          }
          layer.ol.getSource().setUrl(sourceOptions.url);
      } else {
        if (this.state.connection === false) {
          layer.ol.setMaxResolution(0);
        } else if (this.state.connection === true) {
          layer.ol.setMaxResolution(Infinity);
        }
      }
    });
  }
}
