import { Injectable } from '@angular/core';
import RegularShape from 'ol/style/regularshape';
import Icon from 'ol/style/icon';
import Circle from 'ol/style/circle';
import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Style from 'ol/style/style';
import Image from 'ol/style/image';


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
        olCls = Fill;
        break;
      case 'image':
        olCls = Image;
        break;
      case 'stroke':
        olCls = Stroke;
        break;
      case 'style':
        olCls = Style;
        break;
      case 'text':
        // FOR VALIDATION olCls = ol.style[key.charAt(0).toUpperCase() + key.slice(1)];
        olCls = this.getOlCls(key.charAt(0).toUpperCase() + key.slice(1))
       break;
      case 'circle':
        olCls = Circle;
        break;
      case 'regularshape':
        olCls = RegularShape;
        break;
      case 'icon':
        olCls = Icon;
        break;
      default:
        break;
    }

    return olCls;
  }
}
