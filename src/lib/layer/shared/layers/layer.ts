import { DataSource } from '../../../datasource';
import { IgoMap } from '../../../map';

import { LayerOptions } from './layer.interface';

export abstract class Layer {

  public collapsed: boolean;
  public dataSource: DataSource;
  public map: IgoMap;
  public olLayer: ol.layer.Layer;
  public options: LayerOptions;

  get id(): string {
    return this.dataSource.id;
  }

  get title(): string {
    const title = this.options.alias ? this.options.alias : this.options.title;

    return title ? title : this.dataSource.title;
  }

  set title(title: string) {
    this.options.title = title;
  }

  get zIndex(): number {
    return this.olLayer.getZIndex();
  }

  set zIndex(zIndex: number) {
    this.olLayer.setZIndex(zIndex);
  }

  get visible(): boolean {
    return this.olLayer.get('visible');
  }

  set visible(visibility: boolean) {
    this.olLayer.setVisible(visibility);
  }

  get opacity(): number {
    return this.olLayer.get('opacity');
  }

  set opacity(opacity: number) {
    this.olLayer.setOpacity(opacity);
  }

  constructor(dataSource: DataSource, options: LayerOptions) {
    this.dataSource = dataSource;
    this.options = options;

    this.olLayer = this.createOlLayer();
    if (options.zIndex !== undefined) {
      this.zIndex = options.zIndex;
    }

    const legend = dataSource.options.legend || {};
    this.visible = options.visible === undefined ? true : options.visible;
    this.collapsed = legend.collapsed === undefined ? true : !this.visible;
  }

  protected abstract createOlLayer(): ol.layer.Layer;

  addToMap(map: IgoMap) {
    this.map = map;
    map.olMap.addLayer(this.olLayer);
  }

}
