import { HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';

import { RouteServiceOptions } from '@igo2/core/route';
import { LayerOptions, generateIdFromSourceOptions } from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import { PositionParams, ServiceType } from './share-map.interface';
import { buildDataSourceOptions } from './share-map.utils';

interface SharedLayerConfig {
  layers: string[];
  zIndex: number | undefined;
}

export class ShareMapLegacyParser {
  constructor(private options: RouteServiceOptions) {}

  parseUrl(params: Params): LayerOptions[] | undefined {
    const layerOptions = ServiceType.flatMap((type) =>
      this.readLayersQueryParamsByType(params, type)
    ).filter(Boolean);

    return layerOptions;
  }

  parsePosition(params: Params): PositionParams {
    const center = params[this.options.centerKey];
    const projection = params[this.options.projectionKey];
    const zoom = params[this.options.zoomKey];
    const rotation = params[this.options.rotationKey];

    return ObjectUtils.removeUndefined({
      center: center?.split(',').map(Number),
      projection,
      zoom: zoom ? Number(zoom) : undefined,
      rotation: rotation ? Number(rotation) : undefined
    });
  }

  private readLayersQueryParamsByType(
    params: Params,
    type: ServiceType
  ): LayerOptions[] | undefined {
    const [nameParamLayersKey, urlsKey] = this.getQueryKeyByType(params, type);
    if (!nameParamLayersKey || !urlsKey) {
      return undefined;
    }

    const layersByService: string[] = params[nameParamLayersKey].split('),(');
    const urls: string[] = params[urlsKey].split(',');

    return urls
      .map((urlSrc, index) => {
        // Sanitize URL and extract version
        const [url, version] = this.sanitizeUrl(urlSrc);

        const layersConfig = this.extractLayersByService(
          this.removeParenthesis(layersByService[index])
        );

        // Generate layer options for the current service
        return this.extractLayersOptions(
          layersConfig,
          url,
          type,
          version,
          params
        );
      })
      .flat();
  }

  private getQueryKeyByType(
    params: Params,
    type: string
  ): [nameParamLayersKey: string | undefined, urlsKey: string | undefined] {
    let nameParamLayersKey;
    let urlsKey;

    const {
      layersKey,
      wmsUrlKey,
      wmsLayersKey,
      wmtsUrlKey,
      wmtsLayersKey,
      arcgisUrlKey,
      arcgisLayersKey,
      iarcgisUrlKey,
      iarcgisLayersKey,
      tarcgisUrlKey,
      tarcgisLayersKey
    } = this.options;

    switch (type) {
      case 'wms':
        if ((params[layersKey] || params[wmsLayersKey]) && params[wmsUrlKey]) {
          urlsKey = wmsUrlKey;
          nameParamLayersKey = params[wmsLayersKey] ? wmsLayersKey : layersKey;
        }
        break;
      case 'wmts':
        if (params[wmtsLayersKey] && params[wmtsUrlKey]) {
          urlsKey = wmtsUrlKey;
          nameParamLayersKey = wmtsLayersKey;
        }
        break;
      case 'arcgisrest':
        if (params[arcgisLayersKey] && params[arcgisUrlKey]) {
          urlsKey = arcgisUrlKey;
          nameParamLayersKey = arcgisLayersKey;
        }
        break;
      case 'imagearcgisrest':
        if (params[iarcgisLayersKey] && params[iarcgisUrlKey]) {
          urlsKey = iarcgisUrlKey;
          nameParamLayersKey = iarcgisLayersKey;
        }
        break;
      case 'tilearcgisrest':
        if (params[tarcgisLayersKey] && params[tarcgisUrlKey]) {
          urlsKey = tarcgisUrlKey;
          nameParamLayersKey = tarcgisLayersKey;
        }
        break;
    }
    if (!nameParamLayersKey || !urlsKey) {
      return [undefined, undefined];
    }

    return [nameParamLayersKey, urlsKey];
  }

  private sanitizeUrl(url: string): [url: string, version: string | undefined] {
    const version =
      this.getQueryParam('version', url.toLocaleLowerCase()) || undefined;

    if (version) {
      const versionRegex = new RegExp(`[?&]version=${version}`, 'i');
      url = url.replace(versionRegex, '').replace(/[?&]$/, '');
    }

    if (url.endsWith('?')) {
      url = url.substring(0, url.length - 1);
    }
    return [url, version];
  }

  private getQueryParam(name: string, url: string): string | undefined {
    let paramValue;
    if (url.includes('?')) {
      const httpParams = new HttpParams({ fromString: url.split('?')[1] });
      paramValue = httpParams.get(name);
    }
    return paramValue;
  }

  private extractLayersByService(layersByService: string): SharedLayerConfig[] {
    if (!layersByService.includes(':igoz')) {
      return [
        {
          layers: layersByService.split(','),
          zIndex: null
        }
      ];
    }

    const layers = layersByService.match(
      /([^(),:]+(?:,[^(),:]+)*(:[^(),:]+(?:[:][^(),:]+)*)?)/g
    );

    return layers.map((layer) => {
      const [names, zIndex] = layer.split(':igoz');
      return {
        layers: names.split(','),
        zIndex: parseInt(zIndex)
      };
    });
  }

  private removeParenthesis(value: string) {
    if (value.startsWith('(')) {
      value = value.substr(1);
    }

    if (value.endsWith(')')) {
      value = value.slice(0, -1);
    }

    return value;
  }

  private extractLayersOptions(
    layersConfig: SharedLayerConfig[],
    url: string,
    type: ServiceType,
    version: string,
    params: Params
  ): LayerOptions[] {
    return layersConfig.map((layerConfig) => {
      const sourceOptions = buildDataSourceOptions(
        type,
        url,
        layerConfig.layers,
        version
      );
      const id = generateIdFromSourceOptions(sourceOptions);

      const visible = this.computeLayerVisibilityFromUrl(params, id);

      return ObjectUtils.removeUndefined({
        id,
        visible: visible,
        zIndex: layerConfig.zIndex,
        sourceOptions
      });
    });
  }

  private computeLayerVisibilityFromUrl(
    params: Params,
    currentLayerid: string
  ): boolean {
    const queryParams = params;
    let visible = true;
    if (!queryParams || !currentLayerid) {
      return visible;
    }
    let visibleOnLayersParams = '';
    let visibleOffLayersParams = '';
    let visiblelayers: string[] = [];
    let invisiblelayers: string[] = [];
    if (queryParams['visiblelayers']) {
      visibleOnLayersParams = queryParams['visiblelayers'];
    }
    if (queryParams['invisiblelayers']) {
      visibleOffLayersParams = queryParams['invisiblelayers'];
    }

    /* This order is important because to control whichever
         the order of * param. First whe open and close everything.*/
    if (visibleOnLayersParams === '*') {
      visible = true;
    }
    if (visibleOffLayersParams === '*') {
      visible = false;
    }

    // After, managing named layer by id (context.json OR id from datasource)
    visiblelayers = visibleOnLayersParams.split(',');
    invisiblelayers = visibleOffLayersParams.split(',');
    if (
      visiblelayers.indexOf(currentLayerid) > -1 ||
      visiblelayers.indexOf(currentLayerid.toString()) > -1
    ) {
      visible = true;
    }
    if (
      invisiblelayers.indexOf(currentLayerid) > -1 ||
      invisiblelayers.indexOf(currentLayerid.toString()) > -1
    ) {
      visible = false;
    }
    return visible;
  }
}
