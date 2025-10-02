import {
  AnyDataSourceOptions,
  AnyLayer,
  AnyLayerOptions,
  ID_GROUP_PREFIX,
  IgoMap,
  Layer,
  LayerGroup,
  MapViewController,
  WMSDataSourceOptions,
  findParentId,
  getLayerOptionIdentifier,
  isLayerGroup,
  isLayerGroupOptions,
  isLayerItem
} from '@igo2/geo';
import { ObjectUtils, OptionalRequired } from '@igo2/utils';

import type { DetailedContext } from '../../context-manager';
import {
  BaseKeyParams,
  DefinitionParams,
  GroupParams,
  LayerParams,
  PositionParams,
  ServiceType,
  ShareMapKeysDefinitions,
  ShareOption
} from './share-map.interface';
import { getFlattenOptions } from './share-map.utils';

export class ShareMapEncoder {
  private context: DetailedContext | undefined;

  constructor(
    private SHARE_MAP_DEFS: ShareMapKeysDefinitions,
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
    ].filter(Boolean);

    const queryUrl = this.buildQueryUrl(layers, querystring);

    const urlBaseConfig = this.getBaseUrlConfig(map.viewController, language);
    return queryUrl !== '' ? urlBaseConfig + '&' + queryUrl : urlBaseConfig;
  }

  /**
   * Replaces local group IDs with unique IDs to avoid conflicts and have short URL.
   * This is necessary for sharing the map context.
   */
  private replaceGroupLocalIds(layers: AnyLayer[]): void {
    const idMap = new Map<string, string>();
    const existingIds = new Set(
      layers.map((layer) => layer.id).filter(Boolean)
    );

    // eslint-disable-next-line prefer-const
    let counter = 1;
    layers.forEach((layer) => {
      if (layer.id && layer.id.includes(ID_GROUP_PREFIX)) {
        const newId = this.getUniqueId(existingIds, counter);
        idMap.set(layer.id, String(newId));
        layer.options.id = newId;
      }
    });
  }

  private getUniqueId(existingIds: Set<string>, counter: number) {
    while (existingIds.has(String(counter))) {
      counter++;
    }
    existingIds.add(String(counter));
    return counter;
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

  /**
   * Filters layers to include only LayerGroups or LayerItems with a valid ServiceType.
   */
  private isLayerSharable(layers: AnyLayer[]): AnyLayer[] {
    return layers.filter(
      (layer) =>
        isLayerGroup(layer) ||
        (isLayerItem(layer) &&
          ServiceType.includes(layer.dataSource?.options?.type as ServiceType))
    );
  }

  /**
   * Extracts only LayerGroup items from the filtered layers.
   */
  private getLayerGroups(layers: AnyLayer[]): LayerGroup[] {
    return layers.filter(isLayerGroup) as LayerGroup[];
  }

  /**
   * Extracts only LayerItem items from the filtered layers.
   */
  private getLayerItems(layers: AnyLayer[]): Layer[] {
    return layers.filter(isLayerItem) as Layer[];
  }

  private buildQueryUrl(layers: AnyLayer[], querystring: string) {
    const layersSharable = this.isLayerSharable(layers);
    const layersChanged = this.getFilteredMapLayers(layersSharable);

    const groups = this.getLayerGroups(layersChanged);

    this.replaceGroupLocalIds(groups);

    const groupsQueryUrl = this.buildGroupsQueryUrl(groups);

    const layersByService = this.generateLayersOptionsByService(
      this.getLayerItems(layersChanged),
      querystring
    );
    const layersQueryUrl = this.buildLayersQueryUrl(layersByService);

    return [layersQueryUrl, groupsQueryUrl].filter(Boolean).join('&');
  }

  /**
   * Retrieves the current context layers and maps them by identifier.
   */
  private getContextLayersMap(): Map<string, AnyLayerOptions> {
    const ctxLayers = this.getCurrentContext()?.layers || [];
    const ctxFlattened = getFlattenOptions(ctxLayers);

    return new Map(
      ctxFlattened.map((lctx) => {
        const identifier = getLayerOptionIdentifier(lctx);
        return [identifier, lctx] as const;
      })
    );
  }

  /**
   * Filters layers and context layers based on visibility, opacity, and expanded state.
   */
  private getFilteredMapLayers(filteredLayers: AnyLayer[]): AnyLayer[] {
    const ctxLayersMap = this.getContextLayersMap();

    return filteredLayers.filter((layer) => {
      const mapLayerIdentifier = getLayerOptionIdentifier(layer.options);
      if (!mapLayerIdentifier) return false;
      const ctxLayer = ctxLayersMap.get(mapLayerIdentifier);
      if (!ctxLayer) return true;

      const visibilityChange = layer.visible !== (ctxLayer.visible ?? true);
      const opacityChange = layer.opacity !== (ctxLayer.opacity ?? 1);
      const layerParentId = this.getIdsNestedParent(layer)?.join('.');
      const ctxParentId =
        ctxLayer.parentId ?? findParentId(this.context.layers, ctxLayer);
      const parentIdChange = ctxParentId !== layerParentId;

      let expandedChange = false;
      let titleChange = false;
      if (isLayerGroup(layer) && isLayerGroupOptions(ctxLayer)) {
        // Check if the layer group was assign an local id
        // If so, we don't support any change for this case
        if (String(ctxLayer.id).includes(ID_GROUP_PREFIX)) {
          return false;
        }
        expandedChange = (ctxLayer.expanded ?? false) !== layer.expanded;
        titleChange = (ctxLayer.title ?? false) !== layer.title;
      }

      return (
        visibilityChange ||
        opacityChange ||
        expandedChange ||
        titleChange ||
        parentIdChange
      );
    });
  }

  private getIdsNestedParent(
    node: Layer | LayerGroup,
    ids?: string[]
  ): string[] | undefined {
    if (!node.parent) return ids;

    if (node.parent) {
      if (!ids) {
        ids = [node.parent.id];
      } else {
        ids.unshift(node.parent.id);
      }
      return this.getIdsNestedParent(node.parent, ids);
    }

    return ids;
  }

  private generateLayersOptionsByService(
    layers: Layer[],
    querystring: string
  ): [url: string, layers: LayerParams[]][] {
    const layersByUrl = new Map<string, LayerParams[]>();

    layers.forEach((layer) => {
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
    return {
      index: undefined,
      names: this.getLayerNames(dataSourceOptions),
      type: dataSourceOptions?.type,
      opacity: this.getOpacity(layer.opacity),
      parentId: layer.parent?.id,
      visible: this.getVisibility(layer.visible),
      zIndex: layer.zIndex,
      queryString: this.getQueryString(dataSourceOptions?.type, queryString)
    } satisfies OptionalRequired<LayerParams>;
  }

  private getOpacity(opacity: number): number | undefined {
    return opacity === 1 ? undefined : opacity;
  }

  private getVisibility(visibility: boolean | undefined): boolean {
    return !!visibility;
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
    const href = this.document.location.href;
    const baseUrl = this.sanitizeBaseUrl(href);

    const params: string[] = [];
    if (pos) {
      const positionStringified = this.stringifyPosition(
        this.getPosition(viewController)
      );
      params.push(`${pos.key}=${positionStringified}`);
    }
    const contextUri = this.context?.uri;
    if (contextUri) params.push(`${contextKey}=${contextUri}`);

    if (language && !baseUrl.includes(`${languageKey}=`))
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
    if (newQueryString !== '') {
      return `${base}?${newQueryString}&`;
    }
    return `${base}?`;
  }

  private extractKeys(defs: ShareMapKeysDefinitions): string[] {
    const keys: string[] = [];

    for (const key in defs) {
      if (Object.prototype.hasOwnProperty.call(defs, key)) {
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
    const rotationRadians = viewController.getRotation();
    const rotationDegree = (rotationRadians * 180) / Math.PI;
    const ctxRotation = this.getCurrentContext().rotation;
    return rotationDegree === ctxRotation || rotationDegree === 0
      ? undefined
      : rotationDegree;
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

  private buildGroupsQueryUrl(layers: LayerGroup[]): string | undefined {
    if (layers.length === 0) return undefined;
    const { key } = this.SHARE_MAP_DEFS.groups;

    const queryUrl = layers
      .map((layer) => {
        const params = this.getLayerGroupParams(layer);
        return this.stringifyGroupParams(params);
      })
      .join(';');

    return `${key}=${queryUrl}`;
  }

  private getLayerGroupParams(layer: LayerGroup): GroupParams {
    return {
      id: layer.id,
      title: layer.title,
      zIndex: layer.zIndex,
      parentId: layer.parent?.id,
      visible: this.getVisibility(layer.visible),
      opacity: this.getOpacity(layer.opacity),
      expanded: layer.expanded
    } satisfies OptionalRequired<GroupParams>;
  }

  private stringifyGroupParams(params: GroupParams): string {
    return this.stringifyDefinitions(params, this.SHARE_MAP_DEFS.groups.params);
  }
}
