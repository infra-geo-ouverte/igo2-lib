import { Params } from '@angular/router';

import { RouteServiceOptions } from '@igo2/core';
import type { LayerOptions } from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import { ShareMapLegacyParser } from './share-map-legacy.service';
import {
  LayerProperties,
  PositionParams,
  ServiceType,
  ShareMapKeysDefinitions
} from './share-map.interface';
import { buildDataSourceOptions } from './share-map.utils';

export class ShareMapParser {
  legacy: ShareMapLegacyParser;

  constructor(
    private keysDefinitions: ShareMapKeysDefinitions,
    legacyOptions: RouteServiceOptions
  ) {
    this.legacy = new ShareMapLegacyParser(legacyOptions);
  }

  parseLayers(params: Params): LayerOptions[] | undefined {
    const { urlsKey, layers } = this.keysDefinitions;
    const urls = urlsKey ? params[urlsKey]?.split(',') : [];
    const layersList: string[] = layers ? params[layers.key]?.split(';') : [];

    if (!urls || !layersList) {
      return this.legacy.parseUrl(params);
    }

    return layersList
      .map((layer) => this.parseLayer(layer, urls))
      .filter(Boolean);
  }

  parsePosition(params: Params): PositionParams | undefined {
    const position = params[this.keysDefinitions.pos.key];
    if (!position) {
      return this.legacy.parsePosition(params);
    }

    const { center, zoom, rotation, projection } =
      this.keysDefinitions.pos.params;

    const centerMatch = position?.match(center.regex);
    if (!centerMatch) return undefined;

    const zoomValue = this.extractParam(position, zoom.regex);
    const rotationValue = this.extractParam(position, rotation.regex);
    const projectionValue = this.extractParam(position, projection.regex);

    return ObjectUtils.removeUndefined({
      center: center.parse(centerMatch[0]),
      zoom: zoomValue === undefined ? undefined : zoom.parse(zoomValue),
      rotation:
        rotationValue === undefined ? undefined : rotation.parse(rotationValue),
      projection: projectionValue
    });
  }

  private extractParam(value: string, regex: RegExp): string | undefined {
    const match = value.match(regex);
    return match ? match[1] : undefined;
  }

  private parseLayer(layer: string, urls: string[]): LayerOptions {
    const urlIndex = this.extractUrlIndex(layer);
    if (urlIndex === undefined) return undefined;

    const layerNames = this.extractLayerNames(layer);
    if (layerNames === undefined) return undefined;

    const { zIndex, visibility, type, opacity, parentId } =
      this.extractLayerProperties(layer);

    const url = urls[urlIndex];
    const version = this.extractVersionFromUrl(url);

    const sourceOptions = buildDataSourceOptions(
      type,
      url,
      layerNames,
      version
    );

    return ObjectUtils.removeUndefined({
      sourceOptions,
      visible: visibility,
      zIndex,
      opacity,
      parentId
    });
  }

  private extractVersionFromUrl(url: string): string | undefined {
    const { params } = this.keysDefinitions.layers;
    const match = url.match(params.version.regex);
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
    const zIndex = this.parseZindex(properties);
    const visibility = this.parseVisibility(properties);
    const type = this.parseType(properties);
    const opacity = this.parseOpacity(properties);
    const parentId = this.parseParentId(properties);

    return {
      zIndex,
      visibility,
      type,
      opacity,
      parentId
    };
  }

  private parseOpacity(str: string): number | undefined {
    const { opacity } = this.keysDefinitions.layers.params;
    const match = str.match(new RegExp(`(-?\\d+(?:\\.\\d+)?)${opacity.key}`));
    return match ? (opacity.parse(match[1]) as number) : undefined;
  }

  private parseVisibility(str: string): boolean | undefined {
    const { visible } = this.keysDefinitions.layers.params;
    const match = str.match(new RegExp(`([01])${visible.key}`));
    return match ? (visible.parse(match[1]) as boolean) : undefined;
  }

  private parseParentId(str: string): string | undefined {
    const { parentId } = this.keysDefinitions.layers.params;
    const match = str.match(new RegExp(`(\\w+)${parentId.key}`));
    return match ? match[1] : undefined;
  }

  private parseZindex(str: string): number | undefined {
    const { zIndex } = this.keysDefinitions.layers.params;
    const match = str.match(new RegExp(`(-?\\d+)${zIndex.key}`));
    return match ? (zIndex.parse(match[1]) as number) : undefined;
  }

  private parseType(str: string): ServiceType | undefined {
    const { type } = this.keysDefinitions.layers.params;
    const match = str.match(new RegExp(`,(\\d+)${type.key}`));
    return match ? (type.parse(match[1]) as ServiceType) : undefined;
  }
}
