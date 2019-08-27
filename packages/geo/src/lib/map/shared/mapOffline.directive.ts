import { Directive, AfterViewInit } from '@angular/core';
import { NetworkService, ConnectionState } from '@igo2/core';

import { IgoMap } from './map';
import { MapBrowserComponent } from '../map-browser/map-browser.component';
import { FeatureDataSourceOptions } from '../../datasource/shared/datasources/feature-datasource.interface';
import { XYZDataSourceOptions } from '../../datasource/shared/datasources/xyz-datasource.interface';
import { MVTDataSourceOptions } from '../../datasource/shared/datasources/mvt-datasource.interface';

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
      } else if (layer.options.sourceOptions.type === 'xyz') {
        sourceOptions = (layer.options.sourceOptions as XYZDataSourceOptions);
      } else if (layer.options.sourceOptions.type === 'vector') {
        sourceOptions = (layer.options.sourceOptions as FeatureDataSourceOptions);
      } else {
        return;
      }
      if (sourceOptions.pathOffline  &&
        this.state.connection === false) {
          if (sourceOptions.excludeAttributeOffline) {
            sourceOptions.excludeAttributeBackUp = sourceOptions.excludeAttribute;
            sourceOptions.excludeAttribute = sourceOptions.excludeAttributeOffline;
          }
          layer.ol.getSource().clear();
          layer.ol.getSource().setUrl(sourceOptions.pathOffline);
      } else if (sourceOptions.pathOffline &&
        this.state.connection === true) {
          if (sourceOptions.excludeAttributeBackUp) {
            sourceOptions.excludeAttribute = sourceOptions.excludeAttributeBackUp;
          }
          layer.ol.getSource().clear();
          layer.ol.getSource().setUrl(sourceOptions.url);
      }
    });
  }
}
