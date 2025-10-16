import { AuthInterceptor } from '@igo2/auth';
import { Message, MessageService } from '@igo2/core/message';

import BaseEvent from 'ol/events/Event';
import OlLayer from 'ol/layer/Layer';
import { Source } from 'ol/source';

import { BehaviorSubject, Subscription, debounceTime, fromEvent } from 'rxjs';

import { DataSource } from '../../../datasource/shared/datasources';
import type { MapBase } from '../../../map/shared/map.abstract';
import {
  isLayerLinked,
  isLinkMaster
} from '../../shared/layers/linked/linked-layer.utils';
import { isLayerItem, isSaveableLayer } from '../../utils/layer.utils';
import { getLayerLegend } from '../../utils/legend.utils';
import { AnyLayer } from './any-layer';
import { LayerBase, LayerGroupBase } from './layer-base';
import { type LayerGroup } from './layer-group';
import { type LayerOptions } from './layer.interface';
import { Legend, LegendMapViewOptions } from './legend.interface';
import { Linked } from './linked/linked-layer';

export abstract class Layer extends LayerBase {
  declare dataSource: DataSource;
  parent: LayerGroup;

  ol: OlLayer<Source>;
  hasBeenVisible$ = new BehaviorSubject<boolean>(undefined);
  legends$ = new BehaviorSubject<Legend[]>([]);
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

  get legends(): Legend[] {
    return this.legends$.getValue();
  }
  set legends(legends: Legend[]) {
    this.legends$.next(legends);
  }

  public setLegends(legendMapViewOptions?: LegendMapViewOptions) {
    let legendToAssign: Legend[] = [];
    if (this.options?.legendsSpecifications?.legends) {
      const legendsFromSpecifications =
        this.options?.legendsSpecifications?.legends;
      if (this.options?.legendsSpecifications?.handleLegendMethod === 'merge') {
        legendToAssign = legendToAssign.concat(legendsFromSpecifications);
      } else if (
        this.options?.legendsSpecifications?.handleLegendMethod === 'impose'
      ) {
        legendToAssign = legendsFromSpecifications;
        return;
      }
    }

    if (this.options._legends) {
      legendToAssign = legendToAssign.concat(this.options._legends);
    }

    const localLayerLegend = getLayerLegend(this, legendMapViewOptions);
    this.legends = legendToAssign.concat(localLayerLegend);
  }

  constructor(
    public options: LayerOptions,
    protected messageService?: MessageService,
    protected authInterceptor?: AuthInterceptor
  ) {
    super(options);
    this.legends = [];
    this.dataSource = options.source;

    if (this.visible) {
      this.dataSource.addEvents();
    }

    this.ol = this.createOlLayer();
    this.ol.set('_layer', this, true);

    this.setLegends();
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
    this.handleOrMaintainLegends(map);
    this.createLink();
  }

  private handleOrMaintainLegends(map?: MapBase) {
    if (map && this.options.legendsSpecifications?.updateOnViewChange) {
      fromEvent<BaseEvent>(map.viewController.olView, 'change')
        .pipe(debounceTime(750))
        .subscribe(() =>
          this.setLegends({
            scale: map.viewController.getScale(),
            size: map.ol.getSize(),
            extent: map.viewController.getExtent(),
            projection: map.projectionCode
          })
        );
    } else {
      this.setLegends();
    }
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
