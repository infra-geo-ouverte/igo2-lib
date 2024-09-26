import type {
  AnyLayer,
  AnyLayerItemOptions,
  AnyLayerOptions,
  Layer,
  LayerGroup,
  LayerGroupOptions,
  VectorTileLayerOptions
} from '../shared/layers';

export function isLayerGroupOptions(
  option: AnyLayerOptions
): option is LayerGroupOptions {
  return (option as LayerGroupOptions).type === 'group';
}

export function isLayerItemOptions(
  options: AnyLayerOptions
): options is AnyLayerItemOptions {
  return 'source' in options || 'sourceOptions' in options;
}

export function isLayerGroup(layer: AnyLayer): layer is LayerGroup {
  return layer.type === 'group';
}

export function isLayerItem(layer: AnyLayer): layer is Layer {
  return !isLayerGroup(layer);
}

export function isBaseLayer(layer: AnyLayer): layer is Layer {
  return isLayerItem(layer) && layer.baseLayer;
}

function isInternalLayer(layer: AnyLayer): boolean {
  return layer.isIgoInternalLayer;
}

export function isLayerLinked(layer: AnyLayer): layer is Layer {
  return isLayerItem(layer) && !!layer.options.linkedLayers;
}

export function isLayerLinkedParent(layer: AnyLayer): layer is Layer {
  return (
    isLayerItem(layer) &&
    !!layer.options.linkedLayers &&
    !!layer.options.linkedLayers.links
  );
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

  const linkedParent = getLinkedLayerParent(layer, allLayers);
  return linkedParent && isBaseLayer(linkedParent);
}

export function getLinkedLayerParent(
  layer: Layer,
  layers: AnyLayer[]
): AnyLayer | undefined {
  if (!layer.options.linkedLayers) {
    return;
  }

  return layers.find((list_layer) => _isLinkedParent(layer, list_layer));
}

export function getLinkedLayerParentIndex(
  layer: Layer,
  layers: AnyLayer[]
): number {
  if (!layer.options.linkedLayers) {
    return;
  }

  return layers.findIndex((list_layer) => _isLinkedParent(layer, list_layer));
}

function _isLinkedParent(layer: Layer, layerToCheck: AnyLayer): boolean {
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

export function getLinkedLayerOptionsParent(
  options: AnyLayerItemOptions,
  layersOptions: AnyLayerOptions[]
): AnyLayerItemOptions | undefined {
  if (!options.linkedLayers) {
    return;
  }

  return layersOptions.find((list_options) => {
    if (!isLayerItemOptions(list_options)) {
      return;
    }
    const links = list_options.linkedLayers?.links;
    if (links) {
      return links.some((link) =>
        link.linkedIds.includes(options.linkedLayers.linkId)
      );
    }

    return false;
  });
}

export function computeMVTOptionsOnHover(layerOptions: AnyLayerItemOptions) {
  const vectorTileLayerOptions = layerOptions as VectorTileLayerOptions;
  if (
    vectorTileLayerOptions.sourceOptions?.type === 'mvt' &&
    (vectorTileLayerOptions.igoStyle?.styleByAttribute?.hoverStyle ||
      vectorTileLayerOptions.igoStyle?.hoverStyle)
  ) {
    const fc = vectorTileLayerOptions.sourceOptions.featureClass;
    vectorTileLayerOptions.sourceOptions.featureClass = fc ? fc : 'feature';
  }
  return layerOptions;
}

export function isSaveableLayer(layer: Layer): boolean {
  if (isBaseLayer(layer) && !layer.visible) {
    return false;
  }

  if (isInternalLayer(layer)) {
    return false;
  }

  if (layer.options.sourceOptions?.type) {
    return true;
  }
}
