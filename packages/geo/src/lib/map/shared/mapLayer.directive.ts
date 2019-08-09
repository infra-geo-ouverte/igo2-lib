import { Directive, AfterViewInit, OnDestroy, Self, OnInit, EventEmitter, Output } from '@angular/core';
import { IgoMap } from './map';
import { MapBrowserComponent } from '../map-browser/map-browser.component';
import { NetworkService, ConnectionState } from '@igo2/core';
import { Subscription } from 'rxjs';
import { Layer } from '../../layer/shared/layers/layer';

@Directive({
    selector: '[igoMapLayer]'
  })
export class MapLayerDirective implements AfterViewInit {

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
    const layerList = this.map.layers$.value;
    layerList.forEach(layer => {
      if (layer.options.sourceOptions) {
        if (layer.options.sourceOptions.pathOffline  &&
          this.state.connection === false) {
            layer.ol.getSource().clear();
            layer.ol.getSource().setUrl(layer.options.sourceOptions.pathOffline);
        } else if (layer.options.sourceOptions.pathOffline &&
          this.state.connection === true) {
            layer.ol.getSource().clear();
            layer.ol.getSource().setUrl(layer.options.sourceOptions.url);
        }
      }
    });
  }
}
