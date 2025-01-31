import { Location } from '@angular/common';

import {
  AnyDataSourceOptions,
  AnyLayerOptions,
  IgoMap,
  Layer,
  MapViewController,
  WMSDataSourceOptions,
  isLayerItem,
  isLayerItemOptions
} from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import type { DetailedContext } from '../../context-manager';
import {
  BaseKeyParams,
  DefinitionParams,
  LayerParams,
  PositionParams,
  ServiceType,
  ShareMapKeysDefinitions,
  ShareOption
} from './share-map.interface';
import { getLayerParam } from './share-map.utils';

export class ShareMapEncoder {
  private context: DetailedContext | undefined;

  constructor(
    private SHARE_MAP_DEFS: ShareMapKeysDefinitions,
    private location: Location,
    private document: Document
  ) {}

  generateUrl(
    map: IgoMap,
    context: DetailedContext,
    publicShareOption: ShareOption,
    language: string | undefined
  ): string {
    this.context = context;
    const querystring = publicShareOption.layerlistControls?.querystring ?? '';

    const layers = [
      map.layerController.baseLayer,
      ...map.layerController.layersFlattened
    ].filter(
      (layer) =>
        layer &&
        isLayerItem(layer) &&
        ServiceType.includes(layer.dataSource?.options?.type as ServiceType)
    ) as Layer[];

    const layersByService = this.generateLayersOptionsByService(
      layers,
      querystring
    );

    const layersQueryUrl = this.buildLayersQueryUrl(layersByService);

    const urlBaseConfig = this.getBaseUrlConfig(map.viewController, language);

    return layersQueryUrl
      ? `${urlBaseConfig}&${layersQueryUrl}`
      : urlBaseConfig;
  }

  private getCurrentContext(): {
    layers: AnyLayerOptions[];
    center?: [number, number];
    projection?: string;
    zoom?: number;
    rotation?: number;
  } {
    return ObjectUtils.removeUndefined({
      layers: this.context?.layers,
      center: this.context?.map.view.center,
      projection: this.context?.map.view.projection,
      zoom: this.context?.map.view.zoom,
      rotation: this.context?.map.view.rotation
    });
  }

  private filterLayersByContext(layers: Layer[]): Layer[] {
    const ctxLayers =
      this.getCurrentContext()?.layers?.filter((l) => isLayerItemOptions(l)) ||
      [];

    const ctxLayersMap = new Map(
      ctxLayers
        .map((lctx) => [getLayerParam(lctx), lctx] as const)
        .filter(([param]) => param !== undefined)
    );

    return layers.filter((layer) => {
      const newLayerParam = getLayerParam(layer.options);
      if (!newLayerParam) return false;

      const ctxLayer = ctxLayersMap.get(newLayerParam);
      if (!ctxLayer) return true;

      const ctxLVisibility = ctxLayer.visible ?? true;
      const ctxLOpacity = ctxLayer.opacity ?? 1;

      return ctxLVisibility !== layer.visible || ctxLOpacity !== layer.opacity;
    });
  }

  private generateLayersOptionsByService(
    layers: Layer[],
    querystring: string
  ): [url: string, layers: LayerParams[]][] {
    const layersByUrl = new Map<string, LayerParams[]>();
    const layerItems = this.filterLayersByContext(layers);

    layerItems.forEach((layer) => {
      const [url, params] = this.generateLayerOption(layer, querystring);
      if (!layersByUrl.has(url)) {
        layersByUrl.set(url, [params]);
      } else {
        layersByUrl.get(url)!.push(params);
      }
    });
    return Array.from(layersByUrl.entries()).map(([url, layerParams], i) => {
      layerParams.forEach((params) => {
        params.index = i;
      });
      return [url, layerParams];
    });
  }

  private generateLayerOption(
    layer: Layer,
    querystring: string
  ): [url: string, layers: LayerParams] {
    const dataSourceOptions = layer.dataSource.options as AnyDataSourceOptions;

    return [
      this.concatUrlWithVersion(dataSourceOptions),
      this.getLayerParams(layer, querystring)
    ];
  }

  private getLayerNames(dataSourceOptions: AnyDataSourceOptions): string {
    const type = dataSourceOptions.type.toLowerCase() as ServiceType;
    if (type === 'wms') {
      const params = (dataSourceOptions as Partial<WMSDataSourceOptions>)
        .params;
      return params.LAYERS;
    }

    return 'layer' in dataSourceOptions ? dataSourceOptions.layer : '';
  }

  private getWmsVersion(
    dataSourceOptions: AnyDataSourceOptions
  ): string | undefined {
    const params = (dataSourceOptions as Partial<WMSDataSourceOptions>)?.params;
    return params?.VERSION && params.VERSION !== '1.3.0'
      ? params.VERSION
      : undefined;
  }

  private concatUrlWithVersion(
    dataSourceOptions: AnyDataSourceOptions
  ): string {
    const url = dataSourceOptions.url;

    if ((dataSourceOptions.type.toLowerCase() as ServiceType) === 'wms') {
      const version = this.getWmsVersion(dataSourceOptions);
      if (version) {
        const operator = url.includes('?') ? '&' : '?';
        const { version: versionDef } = this.SHARE_MAP_DEFS.layers.params;
        return `${url}${operator}${versionDef.key}=${version}`;
      }
    }

    return dataSourceOptions.url;
  }

  private getLayerParams(layer: Layer, queryString?: string): LayerParams {
    const dataSourceOptions = layer.dataSource.options;
    const params: LayerParams = {
      index: undefined,
      names: this.getLayerNames(dataSourceOptions),
      type: dataSourceOptions?.type,
      opacity: this.getOpacity(layer),
      parentId: layer.parent?.id,
      visible: this.getVisibility(layer),
      zIndex: layer.zIndex,
      queryString: this.getQueryString(dataSourceOptions?.type, queryString)
    };

    return params;
  }

  private getOpacity(layer: Layer): number | undefined {
    return layer.opacity === 1 ? undefined : layer.opacity;
  }

  private getVisibility(layer: Layer): boolean {
    return !!layer.visible;
  }

  private getQueryString(
    type: string,
    queryString: string
  ): string | undefined {
    return (type === 'wms' || type === 'wmts') && queryString !== ''
      ? queryString
      : undefined;
  }

  private buildLayersQueryUrl(
    layersByService: [url: string, params: LayerParams[]][]
  ): string | undefined {
    if (layersByService.length === 0) return undefined;
    const { urlsKey, layers } = this.SHARE_MAP_DEFS;
    const urls = layersByService.map(([url]) => url).join(',');
    const layersWithParams = layersByService
      .flatMap(([_, params]) => params.map((p) => this.stringifyLayerParams(p)))
      .join(';');
    return `${urlsKey}=${urls}&${layers.key}=${layersWithParams}`;
  }

  private stringifyLayerParams(params: LayerParams): string {
    const { index, ...restParams } = params;

    const stringifiedParams = this.stringifyDefinitions(
      restParams,
      this.SHARE_MAP_DEFS.layers.params
    );
    return `${index},${stringifiedParams}`;
  }

  private getBaseUrlConfig(
    viewController: MapViewController,
    language: string | undefined
  ): string {
    const { pos, contextKey, languageKey } = this.SHARE_MAP_DEFS;
    const origin = this.document.location.origin;
    const pathname = this.location.path(false);
    const baseUrl = this.sanitizeBaseUrl(origin + pathname);

    const params: string[] = [];
    if (pos) {
      const positionStringified = this.stringifyPosition(
        this.getPosition(viewController)
      );
      params.push(`${pos.key}=${positionStringified}`);
    }
    const contextUri = this.context?.uri;
    if (contextUri) params.push(`${contextKey}=${contextUri}`);

    if (language && !pathname.includes(`${languageKey}=`))
      params.push(`${languageKey}=${language}`);

    return `${baseUrl}${params.join('&')}`;
  }

  private sanitizeBaseUrl(baseUrl: string): string {
    if (!baseUrl.includes('?')) {
      return `${baseUrl}?`;
    }

    const keys = this.extractKeys(this.SHARE_MAP_DEFS);

    const [base, queryString] = baseUrl.split('?');
    const params = new URLSearchParams(queryString);
    keys.forEach((key) => {
      params.delete(key);
    });
    const newQueryString = params.toString();
    return `${newQueryString ? `${base}?${newQueryString}` : base}&`;
  }

  private extractKeys(defs: ShareMapKeysDefinitions): string[] {
    const keys: string[] = [];

    for (const key in defs) {
      if (defs.hasOwnProperty(key)) {
        const value = defs[key];
        if (typeof value === 'string') {
          keys.push(value);
        } else if (typeof value === 'object' && value !== null) {
          keys.push(value.key);
        }
      }
    }

    return keys;
  }

  private getPosition(viewController: MapViewController): PositionParams {
    return ObjectUtils.removeUndefined({
      center: viewController.getCenter('EPSG:4326'),
      zoom: this.getZoom(viewController),
      rotation: this.getRotation(viewController),
      projection: this.getProjection(viewController)
    });
  }

  private getProjection(viewController: MapViewController): string | undefined {
    const ctxProjection = this.getCurrentContext().projection;
    const mapProjection = viewController.getOlProjection().getCode();
    return ctxProjection === mapProjection ? undefined : mapProjection;
  }

  private getZoom(viewController: MapViewController): number | undefined {
    const mapZoom = viewController.getZoom();
    const ctxZoom = this.getCurrentContext().zoom;
    return ctxZoom === mapZoom ? undefined : mapZoom;
  }

  private getRotation(viewController: MapViewController): number | undefined {
    const mapRotation = viewController.getRotation();
    const ctxRotation = this.getCurrentContext().rotation;
    return mapRotation === ctxRotation || mapRotation === 0
      ? undefined
      : mapRotation;
  }

  private stringifyPosition(position: PositionParams): string {
    const definitions = this.SHARE_MAP_DEFS.pos.params;
    const { center, ...restPosition } = position;
    const stringifiedParams = this.stringifyDefinitions(
      restPosition,
      definitions
    );

    const result = [
      `${definitions.center.key}${definitions.center.stringify(center)}`,
      stringifiedParams
    ].filter(Boolean);

    return result.join(',');
  }

  private stringifyDefinitions(
    values: Record<string, unknown>,
    definitions: DefinitionParams
  ): string | undefined {
    const result = Object.keys(ObjectUtils.removeUndefined(values))
      .map((key) => {
        const { key: defKey, stringify } = definitions[key] as BaseKeyParams;
        const value = stringify ? stringify(values[key]) : values[key];
        return `${value}${defKey}`;
      })
      .join(',');
    return result === '' ? undefined : result;
  }
}
