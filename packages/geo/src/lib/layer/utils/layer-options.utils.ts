import { ObjectUtils } from '@igo2/utils';

import {
  ArcGISRestDataSourceOptions,
  ArcGISRestImageDataSourceOptions,
  TileArcGISRestDataSourceOptions,
  WMSDataSourceOptions,
  WMTSDataSourceOptions
} from '../../datasource';
import {
  AnyLayerItemOptions,
  AnyLayerOptions,
  ID_GROUP_PREFIX,
  LayerGroupOptions,
  LayerOptions
} from '../shared';
import { isLayerGroupOptions, isLayerItemOptions } from './layer.utils';

export function mergeLayersOptions(
  layersOptionsTree: AnyLayerOptions[],
  layersOptions: AnyLayerOptions[]
): AnyLayerOptions[] {
  const tree = [...layersOptionsTree];

  layersOptions.forEach((options) => {
    const identifier = getLayerOptionIdentifier(options);
    if (!identifier) return;

    const currentNode =
      _getNodeById(identifier, tree) ?? _getNodeByTitle(options.title, tree);
    if (currentNode) {
      // if we get layer options by title, we update the id of current layer.
      if (
        isLayerGroupOptions(currentNode) &&
        currentNode.id.toString().includes(ID_GROUP_PREFIX)
      ) {
        currentNode.id = identifier;
      }
      const currentNodeParentID =
        currentNode.parentId ?? findParentId(tree, currentNode);
      const mergedOptions = ObjectUtils.mergeDeep(currentNode, options);

      if (currentNodeParentID === options.parentId) {
        moveOptions(tree, identifier, mergedOptions);
      } else {
        // if we have no parent id it means that we are in the root of the tree.
        if (!options.parentId) mergedOptions.parentId = undefined;
        const initialIdentifier = getLayerOptionIdentifier(currentNode);
        moveOptions(tree, initialIdentifier, mergedOptions);
      }
    } else {
      // Some layers in local context doesn't have an id, if this is the case we
      // check if the layer is already in the tree by its title
      // and if it is we don't add it again. The changes is ignored
      if (isLayerGroupOptions(options)) {
        const currentNode = _getNodeByTitle(options.title, tree);
        if (currentNode) {
          return;
        }
      }

      // handel external Data source options
      if (isLayerItemOptions(options)) {
        handleExternalDataSource(options);
      }
      insertOptions(tree, options);
    }
  });

  return tree;
}

function handleExternalDataSource(options: AnyLayerItemOptions): void {
  options.sourceOptions = {
    ...options.sourceOptions,
    optionsFromCapabilities: true,
    optionsFromApi: true,
    crossOrigin: 'anonymous'
  };
}

export function getLayerOptionIdentifier(
  layerOptions: AnyLayerOptions
): string | undefined {
  return isLayerGroupOptions(layerOptions)
    ? String(layerOptions.id)
    : (getLayerParam(layerOptions) ??
        (layerOptions.id !== undefined
          ? layerOptions.id.toString()
          : undefined));
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

/** Recursive */
function _getNodeByTitle(
  title: string | undefined,
  data: AnyLayerOptions[]
): AnyLayerOptions {
  if (!title) return;
  let node: AnyLayerOptions;
  data.some((item) => {
    const itemTitle = item.title;

    if (itemTitle === title) {
      node = item;
      return true;
    }

    const children = isLayerGroupOptions(item) ? item.children : undefined;
    if (children) {
      node = _getNodeByTitle(title, children);
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
  if (!sourceOptions) return;
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

/**
 * Recursively finds the parent ID of a target layer option within a tree structure.
 *
 * @param tree - The array of layer options representing the tree structure.
 * @param target - The target layer option whose parent ID is to be found.
 * @param path - The current path of IDs traversed during the search (used internally).
 * @returns The parent ID as a dot-separated string, or undefined if no parent is found.
 */
export function findParentId(
  tree: AnyLayerOptions[],
  target: AnyLayerOptions,
  path: string[] = []
): string | undefined {
  const targetId = getLayerOptionIdentifier(target);
  for (const node of tree) {
    const currentPath = node.id ? [...path, node.id.toString()] : [...path];

    if (isLayerGroupOptions(node) && node.children) {
      for (const child of node.children) {
        // Check if the current child node matches the target node by comparing their IDs
        if (getLayerOptionIdentifier(child) === targetId) {
          const targetPath = currentPath?.join('.');
          return targetPath === undefined || targetPath === ''
            ? undefined
            : targetPath;
        }
      }

      const result = findParentId(node.children, target, currentPath);
      if (result) {
        return result;
      }
    }
  }

  return undefined;
}
