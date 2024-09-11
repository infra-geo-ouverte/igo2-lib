import {
  isBaseLayer,
  isLayerItem,
  isLayerItemOptions
} from '../../../utils/layer.utils';
import type { AnyLayer } from '../any-layer';
import type {
  AnyLayerItemOptions,
  AnyLayerOptions
} from '../any-layer.interface';
import type { Layer } from '../layer';
import type {
  LayersLinkProperties,
  LinkedProperties
} from './linked-layer.interface';

export function isLayerLinked(layer: AnyLayer): layer is Layer {
  return isLayerItem(layer) && !!layer.options.linkedLayers;
}

export function isLinkMaster(layer: Layer): boolean {
  return !!layer.options.linkedLayers?.links;
}

export function isLayerLinkedTogether(
  layerA: AnyLayer,
  layerB: AnyLayer,
  layers: AnyLayer[],
  property?: LinkedProperties
): boolean {
  if (!isLayerLinked(layerA) || !isLayerLinked(layerB)) {
    return false;
  }

  let masterLink = isLinkMaster(layerA)
    ? layerA
    : isLinkMaster(layerB)
      ? layerB
      : undefined;
  const isMasterRelation = !!masterLink;

  if (!masterLink) {
    const masterA = getLinkedLayerMaster(layerA, layers);
    const masterB = getLinkedLayerMaster(layerB, layers);
    if (masterA?.id !== masterB?.id) {
      return false;
    }

    masterLink = masterA;
  }

  const links = masterLink.options.linkedLayers.links;
  if (isMasterRelation) {
    const child = masterLink === layerA ? layerB : layerA;
    return !!getLayerLinks(links, child, property);
  }

  const potentialLinks = getLayerLinks(links, layerA, property);
  return potentialLinks?.some((link) => link.linkedIds.includes(layerB.id));
}

function getLayerLinks(
  links: LayersLinkProperties[],
  layer: Layer,
  property?: LinkedProperties
): LayersLinkProperties[] {
  const linkId = layer.options.linkedLayers!.linkId;
  return links.filter((link) => {
    const hasLink = link.linkedIds.includes(linkId);
    if (property) {
      return hasLink && link.properties.includes(property);
    }

    return hasLink;
  });
}

export function isLayerLinkedOptions(
  options: AnyLayerOptions
): options is AnyLayerItemOptions {
  return isLayerItemOptions(options) && !!options.linkedLayers;
}

export function isBaseLayerLinked(
  layer: AnyLayer,
  allLayers: AnyLayer[]
): layer is Layer {
  if (!isLayerItem(layer)) {
    return;
  }

  const linkedMaster = getLinkedLayerMaster(layer, allLayers);
  return linkedMaster && isBaseLayer(linkedMaster);
}

function getLinkedLayerMaster(
  layer: Layer,
  layers: AnyLayer[]
): Layer | undefined {
  if (!layer.options.linkedLayers) {
    return;
  }

  return layers.find((list_layer) =>
    _isLinkedMaster(layer, list_layer)
  ) as Layer;
}

function _isLinkedMaster(layer: Layer, layerToCheck: AnyLayer): boolean {
  if (!isLayerItem(layerToCheck)) {
    return;
  }
  const links = layerToCheck.options.linkedLayers?.links;
  if (links) {
    return links.some((link) =>
      link.linkedIds.includes(layer.options.linkedLayers.linkId)
    );
  }

  return false;
}
