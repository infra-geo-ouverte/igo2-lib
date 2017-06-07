import { Subject } from 'rxjs/Subject';

import { DataSource } from '../../../datasource';
import { IgoMap } from '../../../map';

import { SubjectStatus } from '../../../utils';
import { LayerOptions } from './layer.interface';


export abstract class Layer {

  public collapsed: boolean;
  public dataSource: DataSource;
  public map: IgoMap;
  public ol: ol.layer.Layer;
  public options: LayerOptions;
  public status$: Subject<SubjectStatus>;

  get id(): string {
    return this.dataSource.id;
  }

  get title(): string {
    return this.options.title ? this.options.title : this.dataSource.title;
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

  constructor(dataSource: DataSource, options?: LayerOptions) {
    this.dataSource = dataSource;
    this.options = options || {};
    this.options.view = Object.assign({}, dataSource.options.view, this.options.view);

    this.ol = this.createOlLayer();
    if (options.zIndex !== undefined) {
      this.zIndex = options.zIndex;
    }

    const legend = dataSource.options.legend || {};
    this.visible = options.visible === undefined ? true : options.visible;
    this.collapsed = legend.collapsed === undefined ? true : !this.visible;
  }

  protected abstract createOlLayer(): ol.layer.Layer;

  add(map: IgoMap) {
    this.map = map;
    map.ol.addLayer(this.ol);
  }

  remove() {
    this.map.ol.removeLayer(this.ol);
    this.map = undefined;
  }

}
