import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest
} from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import olLayer from 'ol/layer/Layer';

import { DataSource, Legend } from '../../../datasource';
import { IgoMap } from '../../../map';

import { SubjectStatus } from '@igo2/utils';
import { LayerOptions } from './layer.interface';

export abstract class Layer {
  public collapsed: boolean;
  public dataSource: DataSource;
  public legend: Legend[];
  public legendCollapsed: boolean = true;
  public firstLoadComponent: boolean = true;
  public map: IgoMap;
  public ol: olLayer;
  public status$: Subject<SubjectStatus>;

  private resolution$$: Subscription;

  get id(): string {
    return this.options.id || this.dataSource.id;
  }

  get alias(): string {
    return this.options.alias;
  }

  get title(): string {
    return this.options.title;
  }

  set title(title: string) {
    this.options.title = title;
  }

  get zIndex(): number {
    return this.ol.getZIndex();
  }

  set zIndex(zIndex: number) {
    this.ol.setZIndex(zIndex);
  }

  get baseLayer(): boolean {
    return this.options.baseLayer;
  }

  set baseLayer(baseLayer: boolean) {
    this.options.baseLayer = baseLayer;
  }

  get opacity(): number {
    return this.ol.get('opacity');
  }

  set opacity(opacity: number) {
    this.ol.setOpacity(opacity);
  }

  set isInResolutionsRange(value: boolean) { this.isInResolutionsRange$.next(value); }
  get isInResolutionsRange(): boolean { return this.isInResolutionsRange$.value; }
  readonly isInResolutionsRange$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  set maxResolution(value: number) {
    this.ol.setMaxResolution(value);
    this.updateInResolutionsRange();
  }
  get maxResolution(): number { return this.ol.getMaxResolution(); }

  set minResolution(value: number) {
    this.ol.setMinResolution(value);
    this.updateInResolutionsRange();
  }
  get minResolution(): number { return this.ol.getMinResolution(); }

  set visible(value: boolean) {
    this.ol.setVisible(value);
    this.visible$.next(value);
  }
  get visible(): boolean { return this.visible$.value; }
  readonly visible$: BehaviorSubject<boolean> = new BehaviorSubject(undefined);

  get displayed(): boolean { return this.visible && this.isInResolutionsRange; }
  readonly displayed$: Observable<boolean> = combineLatest([
    this.isInResolutionsRange$,
    this.visible$
  ]).pipe(
    map((bunch: [boolean, boolean]) => bunch[0] && bunch[1])
  );

  get showInLayerList(): boolean {
    return this.options.showInLayerList !== false;
  }

  constructor(public options: LayerOptions) {
    this.dataSource = options.source;

    this.ol = this.createOlLayer();
    if (options.zIndex !== undefined) {
      this.zIndex = options.zIndex;
    }

    if (options.baseLayer && options.visible === undefined) {
      options.visible = false;
    }

    if (options.maxResolution !== undefined) {
      this.maxResolution = options.maxResolution;
    }
    if (options.minResolution !== undefined) {
      this.minResolution = options.minResolution;
    }

    this.visible =
      options.visible === undefined ? true : options.visible;
    this.opacity =
      options.opacity === undefined ? 1 : options.opacity;

    if (
      options.legendOptions &&
      (options.legendOptions.url || options.legendOptions.html)
    ) {
      this.legend = this.dataSource.setLegend(options.legendOptions);
    }

    this.legendCollapsed = options.legendOptions
      ? options.legendOptions.collapsed
        ? options.legendOptions.collapsed
        : true
      : true;

    this.ol.set('_layer', this, true);
  }

  protected abstract createOlLayer(): olLayer;

  setMap(igoMap: IgoMap | undefined) {
    this.map = igoMap;

    this.unobserveResolution();
    if (igoMap !== undefined) {
      this.observeResolution();
    }
  }

  private observeResolution() {
    this.resolution$$ = this.map.viewController.resolution$
      .subscribe(() => this.updateInResolutionsRange());
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
      const minResolution = this.minResolution || 0;
      const maxResolution = this.maxResolution || Infinity;
      this.isInResolutionsRange = resolution >= minResolution && resolution <= maxResolution;
    } else {
      this.isInResolutionsRange = false;
    }
  }
}
