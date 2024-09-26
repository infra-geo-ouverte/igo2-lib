import { AuthInterceptor } from '@igo2/auth';
import { Message, MessageService } from '@igo2/core/message';

import OlLayer from 'ol/layer/Layer';
import { Source } from 'ol/source';

import { BehaviorSubject, Subscription } from 'rxjs';

import { DataSource, Legend } from '../../../datasource/shared/datasources';
import type { MapBase } from '../../../map/shared/map.abstract';
import { GeoDBService } from '../../../offline/geoDB/geoDB.service';
import { LayerDBService } from '../../../offline/layerDB/layerDB.service';
import { isSaveableLayer } from '../../utils/layer.utils';
import { LayerBase, LayerGroupBase } from './layer-base';
import { type LayerGroup } from './layer-group';
import { LayerOptions } from './layer.interface';

export abstract class Layer extends LayerBase {
  declare dataSource: DataSource;
  parent: LayerGroup;

  ol: OlLayer<Source>;
  hasBeenVisible$ = new BehaviorSubject<boolean>(undefined);
  legend: Legend[];
  legendCollapsed = true;
  private resolution$$: Subscription;

  get id(): string {
    return String(this.options.id || this.dataSource.id);
  }

  get visible() {
    return super.visible;
  }
  set visible(value: boolean) {
    this.ol.setVisible(value);
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

  setMap(map: MapBase, parent?: LayerGroupBase | undefined): void {
    super.setMap(map, parent);

    map.layerWatcher.watchLayer(this);

    this.observeResolution();
    this.hasBeenVisible$.subscribe(() => {
      if (this.options.messages && this.visible) {
        this.options.messages.map((message) => {
          this.showMessage(message);
        });
      }
    });
  }

  remove(): void {
    if (!this.map) {
      console.error(`No map for ${this.title}`);
      return;
    }

    this.unobserveResolution();

    super.remove();

    this.map.layerWatcher.unwatchLayer(this);
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
