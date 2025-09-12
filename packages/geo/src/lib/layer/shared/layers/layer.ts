import { Optional } from '@angular/core';

import { AuthInterceptor } from '@igo2/auth';
import { Message, MessageService } from '@igo2/core/message';

import OlLayer from 'ol/layer/Layer';
import { Source } from 'ol/source';

import { BehaviorSubject, Subscription } from 'rxjs';

import { DataSource, Legend } from '../../../datasource/shared/datasources';
import type { MapBase } from '../../../map/shared/map.abstract';
import {
  isLayerLinked,
  isLinkMaster
} from '../../shared/layers/linked/linked-layer.utils';
import { isLayerItem, isSaveableLayer } from '../../utils/layer.utils';
import { AnyLayer } from './any-layer';
import { LayerBase, LayerGroupBase } from './layer-base';
import { type LayerGroup } from './layer-group';
import { type LayerOptions } from './layer.interface';
import { Linked } from './linked/linked-layer';

export abstract class Layer extends LayerBase {
  declare dataSource: DataSource;
  parent: LayerGroup;

  ol: OlLayer<Source>;
  hasBeenVisible$ = new BehaviorSubject<boolean>(undefined);
  legend: Legend[];
  legendCollapsed = true;
  link?: Linked;
  linkMaster?: Linked;
  private resolution$$: Subscription;

  get id(): string {
    return String(this.options.id || this.dataSource.id);
  }

  get visible() {
    return super.visible;
  }
  set visible(value: boolean) {
    super.visible = value;
    if (!this.hasBeenVisible$.value && value) {
      this.hasBeenVisible$.next(value);
    }
    if (this.options?.messages && value) {
      this.options?.messages
        .filter((m) => m.options?.showOnEachLayerVisibility)
        .map((message) => this.showMessage(message));
    }

    value ? this.dataSource.addEvents() : this.dataSource.removeEvents();
  }

  get maxResolution() {
    return super.maxResolution;
  }
  set maxResolution(value: number) {
    super.maxResolution = value;
    this.updateInResolutionsRange();
  }

  get minResolution() {
    return super.minResolution;
  }
  set minResolution(value: number) {
    super.minResolution = value;
    this.updateInResolutionsRange();
  }

  get saveableOptions(): Partial<LayerOptions> | undefined {
    if (!isSaveableLayer(this)) {
      return undefined;
    }

    return {
      ...super.saveableOptions,
      sourceOptions: this.dataSource.saveableOptions
    };
  }

  constructor(
    public options: LayerOptions,
    @Optional() protected messageService?: MessageService,
    @Optional() protected authInterceptor?: AuthInterceptor
  ) {
    super(options);

    this.dataSource = options.source;

    this.legendCollapsed = options.legendOptions
      ? options.legendOptions.collapsed
        ? options.legendOptions.collapsed
        : true
      : true;

    if (
      options.legendOptions &&
      (options.legendOptions.url || options.legendOptions.html)
    ) {
      this.legend = this.dataSource.setLegend(options.legendOptions);
    }

    if (this.visible) {
      this.dataSource.addEvents();
    }

    this.ol = this.createOlLayer();
    this.ol.set('_layer', this, true);

    super.afterCreated();
  }

  protected abstract createOlLayer(): OlLayer<Source>;

  init(map: MapBase): void {
    super.init(map);

    map.layerWatcher.watchLayer(this);

    this.observeResolution();
    this.hasBeenVisible$.subscribe(() => {
      if (this.options.messages && this.visible) {
        this.options.messages.map((message) => {
          this.showMessage(message);
        });
      }
    });

    this.createLink();
  }

  createLink(): void {
    if (!isLinkMaster(this) || this.link) {
      return;
    }
    this.link = new Linked(this);
  }

  remove(): void {
    super.remove();

    this.unobserveResolution();

    this.map.layerWatcher.unwatchLayer(this);

    if (isLinkMaster(this)) {
      this.link?.deleteChildren(this.map.layerController);
      this.link?.destroy();
    }

    if (isLayerLinked(this)) {
      if (!this.linkMaster) {
        return;
      }
      const masterLayer = this.linkMaster.layer;
      const hasSync = this.linkMaster.hasSyncDeletion(this);

      this.linkMaster.remove(this);

      if (hasSync && masterLayer) {
        this.map.layerController.remove(masterLayer);
      }
    }
  }

  add(parent?: LayerGroupBase): void {
    super.add(parent);

    if (isLayerLinked(this)) {
      if (isLinkMaster(this)) {
        this.link.init();
      }

      this.createLinkWithParent();
    }
  }

  moveTo(parent?: LayerGroup): void {
    super.moveTo(parent);

    if (isLayerLinked(this)) {
      this.link?.move(this, parent);
      this.linkMaster?.move(this, parent);
    }
  }

  private createLinkWithParent() {
    const masterLayer = this.findParentByLinkId(
      this.map.layerController.all,
      this.options.linkedLayers.linkId
    );
    if (masterLayer) {
      this.linkMaster = masterLayer.link;
      masterLayer?.link.add(this);
    }
  }

  private findParentByLinkId(layers: AnyLayer[], id: string): Layer {
    return layers.find((layer) => {
      if (!isLayerItem(layer)) {
        return;
      }
      if (layer.options.linkedLayers?.links) {
        return layer.options.linkedLayers.links.some((l) =>
          l.linkedIds.includes(id)
        );
      }
      return false;
    }) as Layer;
  }

  private showMessage(message: Message) {
    this.messageService?.message(message as Message);
  }

  private observeResolution() {
    this.resolution$$ = this.map.viewController.resolution$.subscribe(() =>
      this.updateInResolutionsRange()
    );
  }

  private unobserveResolution() {
    if (this.resolution$$ !== undefined) {
      this.resolution$$.unsubscribe();
      this.resolution$$ = undefined;
    }
  }

  private updateInResolutionsRange() {
    if (this.map !== undefined) {
      const resolution = this.map.viewController.getResolution();
      const minResolution = this.minResolution;
      const maxResolution =
        this.maxResolution === undefined ? Infinity : this.maxResolution;
      this.isInResolutionsRange =
        resolution >= minResolution && resolution <= maxResolution;
    } else {
      this.isInResolutionsRange = false;
    }
  }
}
