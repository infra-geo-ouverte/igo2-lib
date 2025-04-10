import {
  ArcGISRestDataSourceOptions,
  ArcGISRestImageDataSourceOptions,
  TileArcGISRestDataSourceOptions,
  WMSDataSourceOptions,
  WMTSDataSourceOptions
} from '../../datasource';
import { AnyLayerOptions, LayerGroupOptions, LayerOptions } from '../shared';
import { isLayerGroupOptions } from './layer.utils';

export function mergeLayersOptions(
  layersOptionsTree: AnyLayerOptions[],
  layersOptions: AnyLayerOptions[]
): AnyLayerOptions[] {
  const tree = [...layersOptionsTree];

  layersOptions.forEach((options) => {
    const identifier = getLayerOptionIdentifier(options);
    if (!identifier) return;

    const currentNode = _getNodeById(identifier, tree);

    if (currentNode) {
      if (currentNode.parentId === options.parentId) {
        Object.assign(currentNode, options);
      } else {
        const initialIdentifier = getLayerOptionIdentifier(currentNode);
        const mergedOptions = { ...currentNode, ...options };
        moveOptions(tree, initialIdentifier, mergedOptions);
      }
    } else {
      insertOptions(tree, options);
    }
  });

  return tree;
}

export function getLayerOptionIdentifier(
  layerOptions: AnyLayerOptions
): string | undefined {
  return isLayerGroupOptions(layerOptions)
    ? String(layerOptions.id)
    : getLayerParam(layerOptions);
}

function moveOptions(
  tree: AnyLayerOptions[],
  initialIdentifier: string,
  options: AnyLayerOptions
): void {
  removeNode(tree, initialIdentifier);
  insertOptions(tree, options);
}

function insertOptions(
  tree: AnyLayerOptions[],
  options: AnyLayerOptions
): void {
  const parentId = options.parentId;
  if (!parentId) {
    tree.push(options);
  } else {
    const parent = _getNodeById(parentId, tree) as LayerGroupOptions;
    if (parent) {
      (parent.children ??= []).push(options);
      sortLayersOptionsByZIndex(parent.children);
    }
  }
}

/** Recursive */
function _getNodeById(id: string, data: AnyLayerOptions[]): AnyLayerOptions {
  let node: AnyLayerOptions;
  data.some((item) => {
    const identifier = getLayerOptionIdentifier(item);

    if (identifier === id) {
      node = item;
      return true;
    }

    const children = isLayerGroupOptions(item) ? item.children : undefined;
    if (children) {
      node = _getNodeById(id, children);
      if (node) return true;
    }

    return false;
  });
  return node;
}

function removeNode(tree: AnyLayerOptions[], nodeId: string): boolean {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    const currentId = getLayerOptionIdentifier(node);

    if (currentId === nodeId) {
      tree.splice(i, 1);
      return true;
    }

    if (isLayerGroupOptions(node) && node.children?.length) {
      const removed = removeNode(node.children, nodeId);

      if (removed && node.children.length === 0) {
        delete node.children;
      }
      if (removed) return true;
    }
  }
  return false;
}

function sortLayersOptionsByZIndex(layers: AnyLayerOptions[]): void {
  layers.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
}

function getLayerParam(layerOptions: LayerOptions): string | undefined {
  const { sourceOptions } = layerOptions;
  const { type } = sourceOptions;

  switch (type) {
    case 'wms':
      return (
        (sourceOptions as WMSDataSourceOptions).params.LAYERS ??
        (sourceOptions as WMSDataSourceOptions).params['layers']
      );

    case 'wmts':
    case 'arcgisrest':
      return (
        sourceOptions as WMTSDataSourceOptions | ArcGISRestDataSourceOptions
      ).layer;

    case 'imagearcgisrest':
    case 'tilearcgisrest': {
      const { layer, params } = sourceOptions as
        | ArcGISRestImageDataSourceOptions
        | TileArcGISRestDataSourceOptions;
      return layer ?? params?.layer;
    }

    default:
      return undefined;
  }
}
