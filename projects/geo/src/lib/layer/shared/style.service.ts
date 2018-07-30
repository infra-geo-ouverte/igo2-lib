import { Injectable } from '@angular/core';

import {
  Circle,
  Stroke,
  Fill,
  Style,
  Image,
  Icon,
  RegularShape
} from 'ol/style';

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  static style = {
    Regularshape: RegularShape,
    Icon: Icon,
    Circle: Circle,
    Stroke: Stroke,
    Fill: Fill,
    Style: Style,
    Image: Image
  };

  constructor() {}

  createStyle(options: { [key: string]: any }) {
    return this.parseStyle('style', options);
  }

  private parseStyle(key: string, value: any): Style {
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
    const olCls =
      StyleService.style[key.charAt(0).toUpperCase() + key.slice(1)];
    return olCls;
  }
}
