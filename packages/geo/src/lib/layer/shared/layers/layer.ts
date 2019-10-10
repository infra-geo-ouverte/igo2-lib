import { Subject, BehaviorSubject } from 'rxjs';

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
  public options: LayerOptions;
  public status$: Subject<SubjectStatus>;

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

  readonly visible$: BehaviorSubject<boolean> = new BehaviorSubject(undefined);
  get visible(): boolean {
    return this.visible$.value;
  }

  set visible(value: boolean) {
    this.ol.setVisible(value);
    this.visible$.next(value);
  }

  get opacity(): number {
    return this.ol.get('opacity');
  }

  set opacity(opacity: number) {
    this.ol.setOpacity(opacity);
  }

  readonly isInResolutionsRange$: BehaviorSubject<boolean> = new BehaviorSubject(undefined);
  set isInResolutionsRange(value: boolean) {
    this.isInResolutionsRange$.next(value);
  }

  get isInResolutionsRange(): boolean {
    if (!this.map) {
      this.isInResolutionsRange = false;
    }

    const resolution = this.map.viewController.getResolution();
    const minResolution = this.ol.getMinResolution();
    const maxResolution = this.ol.getMaxResolution();

    this.isInResolutionsRange = resolution >= minResolution && resolution <= maxResolution;
    return this.isInResolutionsRange$.value;
  }

  get showInLayerList(): boolean {
    return this.options.showInLayerList !== false;
  }

  constructor(options: LayerOptions) {
    this.options = options;
    this.dataSource = this.options.source;

    this.ol = this.createOlLayer();
    if (this.options.zIndex !== undefined) {
      this.zIndex = this.options.zIndex;
    }

    if (this.options.baseLayer && this.options.visible === undefined) {
      this.options.visible = false;
    }
    this.visible =
      this.options.visible === undefined ? true : this.options.visible;
    this.opacity =
      this.options.opacity === undefined ? 1 : this.options.opacity;

    if (
      this.options.legendOptions &&
      (this.options.legendOptions.url || this.options.legendOptions.html)
    ) {
      this.legend = this.dataSource.setLegend(this.options.legendOptions);
    }

    this.legendCollapsed = this.options.legendOptions
      ? this.options.legendOptions.collapsed
        ? this.options.legendOptions.collapsed
        : true
      : true;

    this.ol.set('_layer', this, true);
  }

  protected abstract createOlLayer(): olLayer;

  setMap(map: IgoMap | undefined) {
    this.map = map;
  }
}
