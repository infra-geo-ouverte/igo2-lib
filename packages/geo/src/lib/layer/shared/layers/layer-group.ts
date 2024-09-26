import { uuid } from '@igo2/utils';

import { Group } from 'ol/layer.js';

import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';

import type { MapBase } from '../../../map/shared/map.abstract';
import { LayerWatcher } from '../../../map/utils/layer-watcher';
import { type AnyLayer } from './any-layer';
import { LayerGroupBase } from './layer-base';
import { type LayerGroupOptions } from './layer-group.interface';

const ID_PREFIX = 'local-group_';

export class LayerGroup extends LayerGroupBase {
  parent: LayerGroup;
  declare ol: Group;
  expanded: boolean;
  private isInResolutionsRange$$: Subscription;
  private layerWatcher: LayerWatcher;
  readonly isInResolutionsRange$ = new BehaviorSubject(true);

  get saveableOptions(): Partial<LayerGroupOptions> {
    return {
      ...super.saveableOptions,
      id: String(this.options.id).includes(ID_PREFIX) ? null : this.options.id,
      type: this.options.type,
      children: [...this.children]
        .map((layer) => layer.saveableOptions)
        .filter(Boolean),
      expanded: this.expanded
    };
  }

  get descendants(): AnyLayer[] {
    return this._getDescendants();
  }

  get descendantsLevel(): number {
    return this._getDescendantsLevel();
  }

  constructor(
    public children: AnyLayer[] | null,
    public options: LayerGroupOptions
  ) {
    super(options);

    this.layerWatcher = new LayerWatcher();

    this.children = children ?? [];

    this.expanded = options.expanded === undefined ? false : options.expanded;

    if (!options.id) {
      options.id = ID_PREFIX + uuid();
    }

    this.ol = this.createOlLayer();

    super.afterCreated();
  }

  setMap(map: MapBase, parent?: LayerGroup, ignoreChildren?: boolean) {
    super.setMap(map, parent);

    this.setChildrenObserver();

    if (ignoreChildren) {
      return;
    }
    this.children.forEach((layer) => {
      layer.setMap(map, this);

      this.layerWatcher.watchLayer(layer);
    });
  }

  addChildren(layers: AnyLayer[]) {
    layers.forEach((layer) => this.addChild(layer));
  }

  addChild(layer: AnyLayer) {
    this.ol.getLayers().extend([layer.ol]);
    if (!this.hasChildren(layer)) {
      this.children.push(layer);
    }

    this.setChildrenObserver();
  }

  remove(): void {
    super.remove();

    this.removeChildrenObserver();
  }

  removeChild(layer: AnyLayer) {
    this.ol.getLayers().remove(layer.ol);
    const index = this.children.indexOf(layer);
    if (index >= 0) {
      this.children.splice(index, 1);
    }
    layer.parent = null;
    layer.options.parentId = null;

    this.setChildrenObserver();
  }

  moveTo(parent?: LayerGroup): void {
    if (parent == null && this.parent == null) {
      return;
    }

    if (this.parent) {
      if (this.parent.id === parent?.id) {
        return;
      }
    }

    this.remove();
    this.setMap(this.map, parent, true);
  }

  isDescendant(layer: AnyLayer): boolean {
    return this._getDescendants().some(
      (descendant) => descendant.id === layer.id
    );
  }

  private setChildrenObserver(): void {
    this.isInResolutionsRange$$?.unsubscribe();

    if (!this.children) {
      return;
    }

    const observers = this.children.map((layer) => layer.isInResolutionsRange$);
    this.isInResolutionsRange$$ = combineLatest(observers).subscribe(
      (values) => {
        this.isInResolutionsRange = values.some((value) => value);
      }
    );
  }

  private removeChildrenObserver(): void {
    this.isInResolutionsRange$$?.unsubscribe();
    this.isInResolutionsRange$$ = undefined;
  }

  protected createOlLayer(): Group {
    return new Group({ properties: { title: this.title } });
  }

  private hasChildren(layer: AnyLayer): boolean {
    return this.children.some((child) => child.id === layer.id);
  }

  /** recursive */
  private _getDescendants(children = this.children): AnyLayer[] {
    return children.reduce((list, child) => {
      if (child instanceof LayerGroup) {
        return list.concat(child, ...this._getDescendants(child.children));
      } else {
        return list.concat(child);
      }
    }, []);
  }

  /** recursive */
  private _getDescendantsLevel(children = this.children): number {
    return children.reduce((level, child) => {
      if (child instanceof LayerGroup) {
        level = level + 1;
        const descendantLevel = this._getDescendantsLevel(child.children);
        return level + descendantLevel;
      }

      return level;
    }, 0);
  }
}
