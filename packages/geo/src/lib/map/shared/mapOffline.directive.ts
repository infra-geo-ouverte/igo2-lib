import { AfterViewInit, Directive } from '@angular/core';

import { ConnectionState, MessageService, NetworkService } from '@igo2/core';

import { combineLatest } from 'rxjs';

import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';
import { Layer } from '../../layer/shared/layers/layer';
import { MapBrowserComponent } from '../map-browser/map-browser.component';
import { IgoMap } from './map';

interface OfflinableSourceOptions extends DataSourceOptions {
  pathOffline?: string;
}

@Directive({
  selector: '[igoMapOffline]'
})
export class MapOfflineDirective implements AfterViewInit {
  private component: MapBrowserComponent;

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
    const initialOnline = window.navigator.onLine;
    this.map.forcedOffline$.subscribe((forcedOffline: boolean) => {
      const online = window.navigator.onLine;
      // prevent first online message if no state change.
      if (initialOnline && initialOnline === online && !forcedOffline) {
        return;
      }
      if (this.previousMessageId) {
        this.messageService.remove(this.previousMessageId);
      }
      if (!forcedOffline && online) {
        const messageObj = this.messageService.info(
          'igo.geo.network.online.message',
          'igo.geo.network.online.title'
        );
        this.previousMessageId = messageObj.toastId;
      } else if (forcedOffline) {
        const messageObj = this.messageService.info(
          'igo.geo.network.offline.message',
          'igo.geo.network.offline.title'
        );
        this.previousMessageId = messageObj.toastId;
      }
    });

    combineLatest([
      this.networkService.currentState(),
      this.map.forcedOffline$,
      this.map.layers$
    ]).subscribe((bunch: [ConnectionState, boolean, Layer[]]) => {
      const online = bunch[0].connection;
      const forcedOffline = bunch[1];
      const layers = bunch[2];
      this.handleLayersOnlineState(online, forcedOffline, layers);
    });
  }

  private handleNonOfflinableLayerResolution(
    online: boolean,
    forcedOffline: boolean,
    layer: Layer
  ) {
    if (!online || forcedOffline) {
      layer.maxResolution = 0;
    } else if (online || !forcedOffline) {
      layer.maxResolution = layer.options.maxResolution || Infinity;
    }
  }

  private handleLayersOnlineState(
    online: boolean,
    forcedOffline: boolean,
    layers: Layer[]
  ) {
    layers.forEach((layer) => {
      let offlinableByUrlSourceOptions;
      if (layer.isIgoInternalLayer) {
        return;
      }
      // detect if layer/source are offlinable by url/pathOffline properties
      if (
        (layer.options.sourceOptions as OfflinableSourceOptions)?.pathOffline
      ) {
        offlinableByUrlSourceOptions = layer.options.sourceOptions;
      }
      if (offlinableByUrlSourceOptions) {
        const type = offlinableByUrlSourceOptions.type;
        if (type === 'mvt') {
          layer.ol.getSource().refresh();
        }
        if (!online || forcedOffline) {
          if (['vector', 'cluster'].includes(type)) {
            return;
          }
          (layer.ol.getSource() as any).setUrl(
            offlinableByUrlSourceOptions.pathOffline
          );
        } else if (!online || !forcedOffline) {
          if (['vector', 'cluster'].includes(type)) {
            return;
          }
          (layer.ol.getSource() as any).setUrl(
            offlinableByUrlSourceOptions.url
          );
        } else {
          this.handleNonOfflinableLayerResolution(online, forcedOffline, layer);
        }
      } else {
        // FOR ALL NON OFFLINABLE SOURCE (i.e. EXCEPT PREVIOUS);
        this.handleNonOfflinableLayerResolution(online, forcedOffline, layer);
        return;
      }
    });
  }
}
