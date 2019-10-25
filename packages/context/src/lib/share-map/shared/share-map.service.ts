import { Injectable, Optional } from '@angular/core';

import { RouteService, ConfigService, MessageService } from '@igo2/core';
import { IgoMap } from '@igo2/geo';

import { ContextService } from '../../context-manager/shared/context.service';

@Injectable({
  providedIn: 'root'
})
export class ShareMapService {
  private apiUrl: string;

  constructor(
    private config: ConfigService,
    private contextService: ContextService,
    private messageService: MessageService,
    @Optional() private route: RouteService
  ) {
    this.apiUrl = this.config.getConfig('context.url');
  }

  getUrl(map: IgoMap, formValues, publicShareOption) {
    if (this.apiUrl) {
      return this.getUrlWithApi(map, formValues);
    }
    return this.getUrlWithoutApi(map, publicShareOption);
  }

  getUrlWithApi(map: IgoMap, formValues) {
    const context = this.contextService.getContextFromMap(map);
    context.scope = 'public';
    context.title = formValues.title;
    context.uri = formValues.uri;
    this.contextService.create(context).subscribe(
      rep => {},
      err => {
        err.error.title = 'Share Map';
        this.messageService.showError(err);
      }
    );
    return `${location.origin + location.pathname}?context=${formValues.uri}`;
  }

  getUrlWithoutApi(map: IgoMap, publicShareOption) {
    if (
      !this.route ||
      !this.route.options.visibleOnLayersKey ||
      !this.route.options.visibleOffLayersKey ||
      !map.viewController.getZoom()
    ) {
      return;
    }
    const llc = publicShareOption.layerlistControls.querystring;

    let visibleKey = this.route.options.visibleOnLayersKey;
    let invisibleKey = this.route.options.visibleOffLayersKey;
    const layers = map.layers;

    const visibleLayers = layers.filter(lay => lay.visible);
    const invisibleLayers = layers.filter(lay => !lay.visible);

    if (visibleLayers.length === 0) {
      visibleKey = '';
    }
    if (invisibleLayers.length === 0) {
      invisibleKey = '';
    }

    let layersUrl = '';
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
    const contextLayersID = [];
    const contextLayers = this.contextService.context$.value.layers;
    for (const contextLayer of contextLayers) {
      contextLayersID.push(contextLayer.id || contextLayer.source.id);
    }
    const addedLayersByService = [];
    for (const layer of layers.filter(
      l => l.dataSource.options && l.dataSource.options.type === 'wms'
    )) {
      if (contextLayersID.indexOf(layer.id) === -1) {
        const wmsUrl = (layer.dataSource.options as any).url;
        const addedLayer = (layer.dataSource.options as any).params.layers;
        const addedLayerPosition = `${addedLayer}:igoz${layer.zIndex}`;

        if (
          !addedLayersByService.find(definedUrl => definedUrl.url === wmsUrl)
        ) {
          addedLayersByService.push({
            url: wmsUrl,
            layers: [addedLayerPosition]
          });
        } else {
          addedLayersByService.forEach(service => {
            if (service.url === wmsUrl) {
              service.layers.push(addedLayerPosition);
            }
          });
        }
      }
    }
    let addedLayersQueryParams = '';
    if (addedLayersByService.length >= 1) {
      const wmsUrlKey = this.route.options.wmsUrlKey;
      const layersKey = this.route.options.layersKey;

      let wmsUrlQueryParams = '';
      let layersQueryParams = '';
      addedLayersByService.forEach(service => {
        wmsUrlQueryParams += `${service.url},`;
        layersQueryParams += `(${service.layers.join(',')}),`;
      });
      wmsUrlQueryParams = wmsUrlQueryParams.endsWith(',')
        ? wmsUrlQueryParams.slice(0, -1)
        : wmsUrlQueryParams;
      layersQueryParams = layersQueryParams.endsWith(',')
        ? layersQueryParams.slice(0, -1)
        : layersQueryParams;
      addedLayersQueryParams = `${wmsUrlKey}=${wmsUrlQueryParams}&${layersKey}=${layersQueryParams}`;
    }

    layersUrl = layersUrl.substr(0, layersUrl.length - 1);

    const zoomKey = this.route.options.zoomKey;
    const centerKey = this.route.options.centerKey;
    const contextKey = this.route.options.contextKey;

    const zoom = `${zoomKey}=${map.viewController.getZoom()}`;
    const arrayCenter = map.viewController.getCenter('EPSG:4326') || [];
    const long = arrayCenter[0].toFixed(5).replace(/\.([^0]+)0+$/, '.$1');
    const lat = arrayCenter[1].toFixed(5).replace(/\.([^0]+)0+$/, '.$1');
    const center = `${centerKey}=${long},${lat}`.replace(/.00000/g, '');
    let context = '';
    if (this.contextService.context$.value) {
      context = `${contextKey}=${this.contextService.context$.value.uri}`;
    }

    let url = `${location.origin}${location.pathname}?${context}&${zoom}&${center}&${layersUrl}&${llc}&${addedLayersQueryParams}`;

    for (let i = 0; i < 5; i++) {
      url = url.replace(/&&/g, '&');
      url = url.endsWith('&') ? url.slice(0, -1) : url;
    }
    url = url.endsWith('&') ? url.slice(0, -1) : url;
    url = url.replace('?&', '?');

    return url;
  }
}
