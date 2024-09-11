import { TREE_SEPERATOR, Tree } from '@igo2/utils';

import {
  BehaviorSubject,
  Observable,
  combineLatest,
  debounceTime,
  map
} from 'rxjs';

import { type MapBase } from '../../map/shared/map.abstract';
import { isBaseLayer, isLayerGroup, isLayerItem } from '../utils/layer.utils';
import { LayerSelectionModel } from './layer-selection';
import type { AnyLayer } from './layers/any-layer';
import type { Layer } from './layers/layer';
import type { LayerGroup } from './layers/layer-group';
import { isLayerLinked } from './layers/linked/linked-layer.utils';

// Below 10 is reserved for BaseLayer
const ZINDEX_MIN = 10;

/**
 * We got four kind of layers
 * TreeLayer: all layers to show in the layer manager
 * Baselayer: Layer dedicated for the basemap
 * SystemLayer: Every layer dedicated to good function of the map (Selection, hovering)
 * OtherLayer: all remaining layer that is linked to another layer or simply not a systemLayer that need to be cleaned on map reset
 */
export class LayerController extends LayerSelectionModel {
  private tree: Tree<AnyLayer>;

  /** Selection, Hovering, every internalLayer not in the tree is here */
  private _systemLayers: AnyLayer[] = [];

  /** LinkedLayer and other layer that are not in the previous category and not visible in tree */
  private _otherLayers: AnyLayer[] = [];

  layersFlattened: AnyLayer[] = [];

  private _layers$ = new BehaviorSubject<AnyLayer[] | undefined>(undefined);
  layers$ = this._layers$.asObservable();

  layersFlattened$ = this._layers$
    .asObservable()
    .pipe(map(() => this.layersFlattened));

  private _baseLayers: Layer[] = [];
  private _baseLayers$ = new BehaviorSubject<Layer[] | undefined>(undefined);
  baseLayers$ = this._baseLayers$.asObservable();

  baseLayerSelection: Layer;

  /** All layers with the tree flattened */
  all$: Observable<AnyLayer[]>;

  constructor(
    private _map: MapBase,
    layers: AnyLayer[]
  ) {
    super();

    this.all$ = combineLatest([this.layersFlattened$, this.baseLayers$]).pipe(
      debounceTime(10),
      map(() => this.all)
    );

    this.tree = new Tree(layers, {
      getChildren: (node) => isLayerGroup(node) && node.children,
      getId: (node) => node.id,
      getLevel: (node) => node.zIndex,
      reverse: true
    });
  }

  get all(): AnyLayer[] {
    return [
      ...this.baseLayers,
      ...this.layersFlattened,
      ...this._systemLayers,
      ...this._otherLayers
    ];
  }

  get baseLayers(): readonly Layer[] {
    return this._baseLayers;
  }

  get baseLayer(): Layer {
    return this.baseLayers.find((layer) => layer.visible);
  }

  get treeLayers(): readonly AnyLayer[] {
    return this.tree.data;
  }

  add(...layers: AnyLayer[]): void {
    const offset = 0;

    const addedLayers = layers
      .map((layer) => this.handleAdd(layer, offset))
      .filter(Boolean);

    if (!addedLayers.length) {
      this.notify();
      return;
    }

    this.tree.add(...addedLayers);

    // Notify the layers change before the iteration on the addedLayer
    // Because the Layer may have have LinkedLayer who need to find the parent.
    this.layersFlattened = [...this.tree.flattened];
    addedLayers.forEach((layer) => layer.add());

    this.recalculateZindex();
    this.notify();
  }

  selectBaseLayer(layer: Layer): void {
    if (!isBaseLayer(layer)) {
      return;
    }

    if (this.baseLayerSelection) {
      this.baseLayerSelection.visible = false;
    }

    layer.visible = true;
    this.baseLayerSelection = layer;

    this._map.viewController.olView.setMinZoom(
      layer.dataSource.options.minZoom || (this._map.options.view || {}).minZoom
    );
    this._map.viewController.olView.setMaxZoom(
      layer.dataSource.options.maxZoom || (this._map.options.view || {}).maxZoom
    );
  }

  remove(...layers: AnyLayer[]): void {
    const list = layers.reduce((list, layer) => {
      if (this.isSelected(layer)) {
        this.deselect(layer);
      }
      const result = this._remove(layer);
      Array.isArray(result) ? list.push(...result) : list.push(result);
      return list;
    }, []);
    this.tree.remove(...list);

    this.notify();
  }

  /**
   * Move a layer into the tree
   * @param layer Layer to move
   * @param beforeTo The index position to move inside a tree
   */
  moveTo(beforeTo: number[], ...layers: AnyLayer[]): AnyLayer[] {
    const movedLayers = this.tree.moveTo(beforeTo, ...layers);
    if (!movedLayers?.length) {
      return;
    }

    return movedLayers;
  }

  moveBelow(layerRef: AnyLayer | undefined, ...layers: AnyLayer[]): void {
    const position = this.getPosition(layerRef, 'below');

    const movedLayers = this.moveTo(position, ...layers);
    this.handleMove(movedLayers, layerRef.parent);
  }

  moveAbove(layerRef: AnyLayer | undefined, ...layers: AnyLayer[]): void {
    const position = this.getPosition(layerRef);

    const movedLayers = this.moveTo(position, ...layers);
    this.handleMove(movedLayers, layerRef.parent);
  }

  moveInside(layerRef: LayerGroup, ...layers: AnyLayer[]): void {
    const position = this.getPosition(layerRef);

    const movedLayers = this.moveTo(position.concat(0), ...layers);
    this.handleMove(movedLayers, layerRef);
  }

  raise(...layers: AnyLayer[]): void {
    const position = this.getPosition(layers[0]);
    const nextPosition = this.findLowestVisiblePostion(position, -1);
    this.moveTo(nextPosition, ...layers);
    this.handleMove(layers, null, true);
  }

  lower(...layers: AnyLayer[]): void {
    const position = this.getPosition(layers[layers.length - 1]);
    const nextPosition = this.findLowestVisiblePostion(position, 2); // +2 because we use moveBefore
    this.moveTo(nextPosition, ...layers);
    this.handleMove(layers, null, true);
  }

  /** Reset all except SystemLayer */
  reset(): void {
    this.clearBaselayers();
    this.clearTree();
    this.clearOther();
    this.clearSelection();

    this.notify();
  }

  getById(id: string): AnyLayer {
    return this.all.find((layer) => layer.id && layer.id === id);
  }

  getBySourceId(id: string): AnyLayer {
    return this.all.find(
      (layer) => layer.dataSource?.id && layer.dataSource.id === id
    );
  }

  getPosition(layer: AnyLayer, type: 'below' | 'above' = 'above'): number[] {
    const position = this.tree.getPosition(layer);

    if (type === 'below') {
      let index = position.pop();
      return position.concat(++index);
    }

    return position;
  }

  getLayerRecipient(layer: AnyLayer): AnyLayer[] {
    return layer.parent
      ? this.tree.getChildren(layer.parent)
      : [...this.treeLayers];
  }

  /**
   * We got non visible layer in the tree like LinkedLayer. We want the next visible layer in tree
   */
  private findLowestVisiblePostion(
    position: number[],
    increment: number
  ): number[] {
    const index = position.pop();
    const nextPosition = position.concat(index + increment);
    const layer = this.tree.getNodeByPosition(nextPosition);
    if (layer && !layer.showInLayerList) {
      const nextIndex = increment > 1 ? 1 : increment;
      return this.findLowestVisiblePostion(nextPosition, nextIndex);
    }
    return nextPosition;
  }

  private handleMove(
    layers: AnyLayer[],
    parent?: LayerGroup,
    keepCurrentParent?: boolean
  ): void {
    if (!layers?.length) {
      return;
    }

    layers.forEach((layer) => {
      layer.moveTo(keepCurrentParent ? layer.parent : parent);
    });
    this._internalMove();
  }

  private _internalMove() {
    this.recalculateZindex();
    this.notify();
  }

  private getBefore(layer: AnyLayer): AnyLayer {
    return this.treeLayers.find(
      (layerTree) => layerTree.zIndex <= layer.zIndex
    );
  }

  /** Recursive */
  private recalculateZindex(
    minIndex = this.baseLayers.length,
    layers = this.treeLayers
  ) {
    return [...layers].reverse().reduce((previousZindex, layer) => {
      let zIndex = ++previousZindex;
      layer.zIndex = zIndex;
      if (isLayerGroup(layer)) {
        zIndex = this.recalculateZindex(zIndex, layer.children);
      }

      return zIndex;
    }, minIndex);
  }

  private handleAdd(layer: AnyLayer, offset?: number): AnyLayer {
    const existingLayer = this.getById(layer.id);
    if (existingLayer !== undefined) {
      existingLayer.visible = true;
      return;
    }

    const zIndex = this.getZindexOffset(layer, offset);
    this.setZindex(layer, zIndex);

    layer.init(this._map);

    if (isBaseLayer(layer)) {
      if (layer.visible) {
        this.selectBaseLayer(layer);
      }
      this._baseLayers.push(layer);
    } else if (this.isOtherLayer(layer)) {
      this._otherLayers.push(layer);
    } else if (this.isSystemLayer(layer) && !layer.showInLayerList) {
      this._systemLayers.push(layer);
    } else if (layer.showInLayerList) {
      return layer;
    } else {
      this._otherLayers.push(layer);
    }

    const parent: LayerGroup | undefined = layer.parentId
      ? (this.getById(layer.parentId.split(TREE_SEPERATOR).pop()) as LayerGroup)
      : undefined;
    layer.add(parent);

    return;
  }

  private _remove(layer: AnyLayer): AnyLayer | AnyLayer[] {
    if (isBaseLayer(layer)) {
      this.removeBaselayer(layer);
    } else if (this.isOtherLayer(layer)) {
      this.removeOtherLayer(layer);
    } else if (this.isSystemLayer(layer)) {
      this.removeSystemLayer(layer);
    }

    layer.remove();
    return layer;
  }

  private removeBaselayer(layer: AnyLayer) {
    this.removeIn(layer, this._baseLayers);
  }

  private removeSystemLayer(layer: AnyLayer) {
    this.removeIn(layer, this._systemLayers);
  }

  private removeOtherLayer(layer: AnyLayer) {
    this.removeIn(layer, this._otherLayers);
  }

  private removeIn(layer: AnyLayer, store: AnyLayer[]) {
    const index = store.findIndex((sysLayer) => sysLayer.id === layer.id);
    if (index === -1) {
      return;
    }
    store.splice(index, 1);
  }

  private isSystemLayer(layer: AnyLayer): boolean {
    return isLayerItem(layer) && layer.isIgoInternalLayer;
  }

  private isOtherLayer(layer: AnyLayer): boolean {
    return isLayerLinked(layer) && !layer.showInLayerList;
  }

  private clearBaselayers(): void {
    this.baseLayers.forEach((layer) => this._remove(layer));
    this._baseLayers = [];
  }

  private clearTree(): void {
    this.treeLayers.forEach((layer) => this._remove(layer));
    this.tree.clear();
  }

  private clearSystems(): void {
    this._systemLayers.forEach((layer) => this._remove(layer));
    this._systemLayers = [];
  }

  private clearOther(): void {
    this._otherLayers.forEach((layer) => this._remove(layer));
    this._otherLayers = [];
  }

  private getZindexOffset(layer: AnyLayer, previousOffset = 0): number {
    return layer.zIndex ? 0 : previousOffset++;
  }

  private setZindex(layer: AnyLayer, offset?: number): void {
    if (isBaseLayer(layer)) {
      return this.handleBaselayerZIndex(layer, offset);
    }
    if (layer.zIndex === undefined || layer.zIndex === 0) {
      const maxZIndex = Math.max(
        ZINDEX_MIN,
        ...this.treeLayers.map((l) => l.zIndex)
      );
      layer.zIndex = maxZIndex + 1 + (offset ?? 0);
    }
  }

  private handleBaselayerZIndex(layer: Layer, offset?: number) {
    const maxZIndex = Math.max(0, ...this.baseLayers.map((l) => l.zIndex));

    const zIndex = maxZIndex + 1 + (offset ?? 0);
    layer.zIndex = zIndex > ZINDEX_MIN ? ZINDEX_MIN : zIndex;
  }

  private notify(): void {
    this.layersFlattened = [...this.tree.flattened];
    this._layers$.next([...this.treeLayers]);
    this._baseLayers$.next([...this.baseLayers]);
  }
}
