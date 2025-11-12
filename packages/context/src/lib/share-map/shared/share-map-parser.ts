import { Params } from '@angular/router';

import { RouteServiceOptions } from '@igo2/core/route';
import {
  type AnyLayerOptions,
  type LayerGroupOptions,
  type LayerOptions
} from '@igo2/geo';
import { ObjectUtils, OptionalRequired } from '@igo2/utils';

import { ShareMapLegacyParser } from './share-map-legacy.service';
import {
  LayerProperties,
  PositionParams,
  ServiceType,
  ShareMapKeysDefinitions
} from './share-map.interface';
import {
  buildDataSourceOptions,
  getParamValue,
  hasLegacyParams,
  hasModernShareParams
} from './share-map.utils';

type BaseLayerOptionsParsed = Pick<
  LayerOptions,
  'visible' | 'zIndex' | 'opacity' | 'parentId'
> &
  Partial<Pick<LayerOptions, 'id'>>;

type LayerOptionsParsed = BaseLayerOptionsParsed &
  Pick<LayerOptions, 'sourceOptions'>;

type LayerGroupOptionsParserd = BaseLayerOptionsParsed &
  Pick<LayerGroupOptions, 'id' | 'title' | 'expanded' | 'type'>;

export class ShareMapParser {
  legacy: ShareMapLegacyParser;

  constructor(
    private keysDefinitions: ShareMapKeysDefinitions,
    private legacyOptions: RouteServiceOptions
  ) {
    this.legacy = new ShareMapLegacyParser(legacyOptions);
  }

  parseLayers(params: Params): AnyLayerOptions[] | undefined {
    if (
      !hasModernShareParams(params, this.keysDefinitions) &&
      hasLegacyParams(params, this.legacyOptions)
    ) {
      return this.legacy.parseUrl(params);
    }

    const {
      urlsKey,
      layers: layersDef,
      groups: groupsDef
    } = this.keysDefinitions;

    const layersArray = this.splitParam(
      getParamValue(params, layersDef.key),
      ';'
    );
    const urlsArray = this.splitParam(getParamValue(params, urlsKey), ',');
    const groupsArray = this.splitParam(
      getParamValue(params, groupsDef.key),
      ';'
    );

    const groupsOptions = groupsArray.map((layer) => this.parseGroup(layer));
    const layersOptions = layersArray
      .map((layer) => this.parseLayer(layer, urlsArray))
      .filter(Boolean);
    return [...groupsOptions, ...layersOptions];
  }

  private splitParam(value: string | undefined, delimiter: string): string[] {
    return value ? value.split(delimiter) : [];
  }

  parsePosition(params: Params): PositionParams | undefined {
    const position = params[this.keysDefinitions.pos.key];
    if (!position) {
      return this.legacy.parsePosition(params);
    }

    const { center, zoom, rotation, projection } =
      this.keysDefinitions.pos.params;

    return ObjectUtils.removeUndefined({
      center: center.parse(position) as [number, number],
      zoom: zoom.parse(position) as number,
      rotation: rotation.parse(position) as number,
      projection: projection.parse(position) as string
    } satisfies OptionalRequired<PositionParams>);
  }

  private parseLayer(
    layer: string,
    urls: string[]
  ): LayerOptionsParsed | undefined {
    const { zIndex, visibility, type, opacity, parentId } =
      this.extractLayerProperties(layer);
    const base = {
      visible: visibility,
      zIndex,
      opacity,
      parentId
    } satisfies BaseLayerOptionsParsed;

    const layerNames = this.extractLayerNames(layer);

    if (layerNames) {
      const urlIndex = this.extractUrlIndex(layer);
      if (urlIndex === undefined) return undefined;

      const url = urls[urlIndex];
      const version = this.extractVersionFromUrl(url);

      const sourceOptions = buildDataSourceOptions(
        type,
        url,
        layerNames,
        version
      );

      return ObjectUtils.removeUndefined({
        id: undefined,
        sourceOptions,
        ...base
      } satisfies OptionalRequired<LayerOptionsParsed>);
    }

    const id = this.extractLayerId(layer);
    if (!id) return undefined;
    return ObjectUtils.removeUndefined({
      id,
      sourceOptions: undefined,
      ...base
    } satisfies OptionalRequired<LayerOptionsParsed>);
  }

  private parseGroup(properties: string): LayerGroupOptionsParserd {
    const { params } = this.keysDefinitions.groups;
    return ObjectUtils.removeUndefined({
      id: params.id.parse(properties) as string,
      title: params.title.parse(properties) as string,
      zIndex: params.zIndex.parse(properties) as number,
      visible: params.visible.parse(properties) as boolean,
      opacity: params.opacity.parse(properties) as number,
      parentId: params.parentId.parse(properties) as string,
      expanded: params.expanded.parse(properties) as boolean,
      type: 'group'
    } satisfies OptionalRequired<LayerGroupOptionsParserd>);
  }

  private extractVersionFromUrl(url: string): string | undefined {
    const versionDef = this.keysDefinitions.layers.params.version;
    return versionDef.parse(url) as string;
  }

  private extractLayerId(layer: string): string | undefined {
    const { id } = this.keysDefinitions.layers.params;
    const regex = new RegExp(`([a-zA-Z0-9_]+)${id.key}\\b`);
    const match = layer.match(regex);
    return match ? match[1] : undefined;
  }

  private extractUrlIndex(layer: string): number | undefined {
    const { index } = this.keysDefinitions.layers.params;
    const regex = index ? new RegExp(`([\\d.]+)${index}`) : /([\d.]+)/;
    const match = layer.match(regex);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private extractLayerNames(layer: string): string[] | undefined {
    const { names } = this.keysDefinitions.layers.params;
    const pattern = new RegExp(`\\[.*?\\]${names.key}`, 'g');

    const matches = layer.match(pattern);
    if (!matches) return undefined;

    return matches
      .map((match) => match.slice(1, -`]${names.key}`.length))
      .join('\n')
      .split(',');
  }

  private extractLayerProperties(properties: string): LayerProperties {
    const { params } = this.keysDefinitions.layers;
    return {
      zIndex: params.zIndex.parse(properties) as number,
      visibility: params.visible.parse(properties) as boolean,
      type: params.type.parse(properties) as ServiceType,
      opacity: params.opacity.parse(properties) as number,
      parentId: params.parentId.parse(properties) as string
    } satisfies OptionalRequired<LayerProperties>;
  }
}
