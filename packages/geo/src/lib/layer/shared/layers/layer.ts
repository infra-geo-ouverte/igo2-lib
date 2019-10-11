import { Subject } from 'rxjs';

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

  get visible(): boolean {
    return this.ol.get('visible');
  }

  set visible(visibility: boolean) {
    this.ol.setVisible(visibility);
  }

  get opacity(): number {
    return this.ol.get('opacity');
  }

  set opacity(opacity: number) {
    this.ol.setOpacity(opacity);
  }

  get isInResolutionsRange(): boolean {
    if (!this.map) {
      return false;
    }

    const resolution = this.map.viewController.getResolution();
    const minResolution = this.ol.getMinResolution();
    const maxResolution = this.ol.getMaxResolution();

    return resolution >= minResolution && resolution <= maxResolution;
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
