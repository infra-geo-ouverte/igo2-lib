import { Directive, AfterViewInit } from '@angular/core';
import { IgoMap } from './map';
import { MapBrowserComponent } from '../map-browser/map-browser.component';
import { NetworkService, ConnectionState } from '@igo2/core';
import { Subscription } from 'rxjs';
import { Layer } from '../../layer/shared/layers/layer';
import { MVTDataSourceOptions, XYZDataSourceOptions, FeatureDataSourceOptions } from '../../datasource';

@Directive({
    selector: '[igoMapOffline]'
  })
export class MapOfflineDirective implements AfterViewInit {

  private context$$: Subscription;
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
      console.log(state);
      this.state = state;
      this.changeLayer();
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
