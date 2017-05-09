import { DataSource } from '../../../datasource';

import { Layer } from './layer';
import { VectorLayerOptions } from './vector-layer.interface';


export class VectorLayer extends Layer {

  public options: VectorLayerOptions;
  public ol: ol.layer.Vector;

  constructor(dataSource: DataSource, options: VectorLayerOptions) {
    super(dataSource, options);
  }

  protected createOlLayer(): ol.layer.Vector {
    const style = this.getStyleFromOptions(this.options);

    const olOptions = Object.assign(this.options.view || {}, {
      style: style,
      source: this.dataSource.ol as ol.source.Vector
    });

    return new ol.layer.Vector(olOptions);
  }

  private getStyleFromOptions(options: VectorLayerOptions) {
    let style;
    if (options.style) {
      style = this.parseStyle('style', options.style);
    }

    return style;
  }

  private parseStyle(key: string, value: any): ol.style.Style {
    const styleOptions = {};
    const olCls = this.getOlCls(key);

    if (olCls && value instanceof Object) {
      Object.keys(value).forEach(_key => {
        const _olKey = this.getOlKey(_key);
        styleOptions[_olKey] = this.parseStyle(_key, value[_key]);
      });
      return new olCls(styleOptions);
    } else {
      return value;
    }
  }

  private getOlKey(key: any) {
    let olKey = key.toLowerCase();
    switch (olKey) {
      case 'circle':
      case 'regularshape':
      case 'icon':
        olKey = 'image';
        break;
      default:
        break;
    }

    return olKey;
  }

  private getOlCls(key: any) {
    let olCls;
    switch (key) {
      case 'fill':
      case 'image':
      case 'stroke':
      case 'style':
      case 'text':
        olCls = ol.style[key.charAt(0).toUpperCase() + key.slice(1)];
        break;
      case 'circle':
        olCls = ol.style.Circle;
        break;
      case 'regularshape':
        olCls = ol.style.RegularShape;
        break;
      case 'icon':
        olCls = ol.style.Icon;
        break;
      default:
        break;
    }

    return olCls;
  }

}
