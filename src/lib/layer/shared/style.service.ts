import { Injectable } from '@angular/core';
import * as ol from 'openlayers';


@Injectable()
export class StyleService {

  constructor() { }

  createStyle(options: {[key: string]: any}) {
    return this.parseStyle('style', options);
  }

  private parseStyle(key: string, value: any): ol.style.Style {
    const styleOptions = {};
    const olCls = this.getOlCls(key);

    if (olCls && value instanceof Object) {
      Object.keys(value).forEach(_key => {
        const olKey = this.getOlKey(_key);
        styleOptions[olKey] = this.parseStyle(_key, value[_key]);
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
