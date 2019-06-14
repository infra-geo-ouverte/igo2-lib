import { Injectable } from '@angular/core';

import * as olstyle from 'ol/style';

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  constructor() {}

  createStyle(options: { [key: string]: any }) {
    return this.parseStyle('style', options);
  }

  private parseStyle(key: string, value: any): olstyle {
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
    let olCls = olstyle[key.charAt(0).toUpperCase() + key.slice(1)];
    if (key === 'regularshape') {
      olCls = olstyle.RegularShape;
    }

    return olCls;
  }

  createStyleByAttribute(feature, attribute: string, data: Array<any>,
    fill?: Array<string>, stroke?: Array<string>, radius?: Array<number>, icon?: Array<string>,
    scale?: Array<number>, type?: string) {
   let style;
   const size = data.length;
   if (type === 'circle') {
     for (let i = 0; i < size; i++) {
       if (feature.get(attribute) === data[i]) {
         if (icon) {
          style = [new olstyle.Style({
            image: new olstyle.Icon({
              src: icon[i],
              scale: scale ? scale[i] : 1
            })
          })];
          return style;
         }
         style = [new olstyle.Style({
           image: new olstyle.Circle({
             radius: radius ? radius[i] : 4,
             stroke: new olstyle.Stroke({
               color: stroke ? stroke[i] : 'black'
             }),
             fill: new olstyle.Fill({
               color: fill ? fill[i] : 'black'
             })
           })
         })];
       return style;
       }
     }
    } else if (type === 'regular') {
       for (let i = 0; i < size; i++) {
         if (feature.get(attribute) === data[i]) {
           style = [new olstyle.Style({
             stroke: new olstyle.Stroke({
               color: stroke ? stroke[i] : 'black'
             }),
             fill: new olstyle.Fill({
               color: fill ? fill[i] : 'rgba(255,255,255,0.4)'
             })
           })];
           return style;
          }
        }
        if (!feature.getStyle()) {
          style = [new olstyle.Style({
            stroke: new olstyle.Stroke({
              color: 'black'
            }),
            fill: new olstyle.Fill({
              color: '#bbbbf2'
            })
          })];
          return style;
        }
      }
  }
}
