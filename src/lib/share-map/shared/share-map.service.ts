import { Injectable, Optional } from '@angular/core';

import { RouteService, ConfigService, MessageService } from '../../core';
import { IgoMap } from '../../map';
import { ContextService } from '../../context';

@Injectable()
export class ShareMapService {

  private urlApi: string;

  constructor(private config: ConfigService,
              private contextService: ContextService,
              private messageService: MessageService,
              @Optional() private route: RouteService) {

    this.urlApi = this.config.getConfig('context.url');
  }

  getUrl(map: IgoMap, formValues) {
    if (this.urlApi) {
      return this.getUrlWithApi(map, formValues);
    }
    return this.getUrlWithoutApi(map);
  }

  getUrlWithApi(map: IgoMap, formValues) {
    const context = this.contextService.getContextFromMap(map);
    context.scope = 'public';
    context.title = formValues.title;
    context.uri = formValues.uri;
    this.contextService.create(context).subscribe(
      (rep) => {},
      (err) => {
        this.messageService.error(err.error.message, 'Share Map');
      }
    );
    return `${location.origin + location.pathname}?context=${formValues.uri}`;
  }

  getUrlWithoutApi(map: IgoMap) {
    if (!this.route || !this.route.options.visibleOnLayersKey ||
        !this.route.options.visibleOffLayersKey) {
          return;
    }

    const visibleKey = this.route.options.visibleOnLayersKey;
    const invisibleKey = this.route.options.visibleOffLayersKey;
    const layers = map.layers;

    const visibleLayers = layers.filter(lay => lay.visible);
    const invisibleLayers = layers.filter(lay => !lay.visible);

    let layersUrl: string = '';
    let layersToLoop = [];
    if (visibleLayers.length > invisibleLayers.length) {
      layersUrl = `${visibleKey}=*&${invisibleKey}=`;
      layersToLoop = invisibleLayers;
    } else {
      layersUrl = `${invisibleKey}=*&${visibleKey}=`;
      layersToLoop = visibleLayers;
    }

    for (const layer of layersToLoop) {
      if (layer.id) {
        layersUrl += layer.id + ',';
      }
    }
    layersUrl = layersUrl.substr(0, layersUrl.length - 1);

    const zoom = 'zoom=' + map.getZoom();
    const arrayCenter = map.getCenter('EPSG:4326') || [];
    const center = 'center=' + arrayCenter.toString();
    let context = '';
    if (this.contextService.context$.value) {
        context = 'context=' + this.contextService.context$.value.uri;
    }
    return `${location.origin + location.pathname}?${context}&${zoom}&${center}&${layersUrl}`;
  }

}
