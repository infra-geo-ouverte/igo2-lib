import type {
  AnyLayer,
  AnyLayerItemOptions,
  AnyLayerOptions,
  Layer,
  LayerGroup,
  LayerGroupOptions,
  VectorTileLayerOptions
} from '../shared/layers';

type SortDirection = 'asc' | 'desc';

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

/** Recursive */
export function sortLayersByZindex(
  layers: AnyLayer[],
  direction: SortDirection
): AnyLayer[] {
  return layers
    .sort(direction === 'desc' ? sortLayerByZIndexDesc : sortLayerByZIndexAsc)
    .map((layer) => {
      if (isLayerGroup(layer)) {
        sortLayersByZindex([...layer.children], direction);
      }
      return layer;
    });
}

function sortLayerByZIndexDesc(layer1: AnyLayer, layer2: AnyLayer) {
  return layer2.zIndex - layer1.zIndex;
}

function sortLayerByZIndexAsc(layer1: AnyLayer, layer2: AnyLayer) {
  return layer1.zIndex - layer2.zIndex;
}
