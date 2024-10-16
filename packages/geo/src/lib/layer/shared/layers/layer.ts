import { AuthInterceptor } from '@igo2/auth';
import { Message, MessageService } from '@igo2/core/message';

import OlLayer from 'ol/layer/Layer';
import { Source } from 'ol/source';

import { BehaviorSubject, Subscription } from 'rxjs';

import { DataSource, Legend } from '../../../datasource/shared/datasources';
import { isLinkMaster } from '../../../map/shared/linkedLayers.utils';
import type { MapBase } from '../../../map/shared/map.abstract';
import { GeoDBService } from '../../../offline/geoDB/geoDB.service';
import { LayerDBService } from '../../../offline/layerDB/layerDB.service';
import {
  isLayerItem,
  isLayerLinked,
  isSaveableLayer
} from '../../utils/layer.utils';
import { AnyLayer } from './any-layer';
import { LayerBase, LayerGroupBase } from './layer-base';
import { type LayerGroup } from './layer-group';
import { type LayerOptions } from './layer.interface';
import { Linked } from './linked-layer';

export abstract class Layer extends LayerBase {
  declare dataSource: DataSource;
  parent: LayerGroup;

  ol: OlLayer<Source>;
  hasBeenVisible$ = new BehaviorSubject<boolean>(undefined);
  legend: Legend[];
  legendCollapsed = true;
  link?: Linked;
  linkParent?: Linked;
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
    protected messageService?: MessageService,
    protected authInterceptor?: AuthInterceptor,
    protected geoDBService?: GeoDBService,
    public layerDBService?: LayerDBService
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

  remove(soft: boolean): void {
    super.remove(soft);

    if (soft) {
      return;
    }
    this.unobserveResolution();

    this.map.layerWatcher.unwatchLayer(this);

    if (isLinkMaster(this)) {
      this.link?.deleteChildren();
      this.link?.destroy();
    }

    if (isLayerLinked(this)) {
      const parentLayer = this.linkParent?.layer;
      const hasSync = this.linkParent?.hasSyncDeletion(this);

      this.linkParent?.remove(this);
      this.linkParent = undefined;

      if (hasSync && parentLayer) {
        parentLayer.remove(false);
      }
    }
  }

  add(parent?: LayerGroupBase, soft?: boolean): void {
    super.add(parent);

    if (soft) {
      return;
    }
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
      this.linkParent?.move(this, parent);
    }
  }

  private createLinkWithParent() {
    const linkParent = this.findParentByLinkId(
      this.map.layerController.all,
      this.options.linkedLayers.linkId
    );
    if (linkParent) {
      this.linkParent = linkParent.link;
      linkParent?.link.add(this);
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
    if (!this.messageService) {
      return;
    }
    this.messageService.message(message as Message);
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
