import { Injectable } from '@angular/core';

import * as olstyle from 'ol/style';

import { ClusterParam } from './clusterParam';

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

  createClusterStyle(feature, clusterParam: ClusterParam) {
    let style;
    const range = clusterParam.clusterRange;
    const icon = clusterParam.clusterIcon;
    const scale = clusterParam.clusterScale;
    const size = feature.get('features').length;
    let color;
    if (size !== 1) {
      if (range) {
        if (size >= range[1]) {
            color = 'red';
        } else if (size < range[1] && size >= range[0]) {
            color = 'orange';
        } else if (size < range[0]) {
            color = 'green';
        }
      }
      style = [new olstyle.Style({
        image: new olstyle.Circle({
            radius: 2 * size + 3.4,
            stroke: new olstyle.Stroke({
                color: 'black'
            }),
            fill: new olstyle.Fill({
                color: range ? color : 'blue'
            })
        }),
        text: new olstyle.Text({
            text: size.toString(),
            fill: new olstyle.Fill({
                color: '#fff'
            })
        })
      })];
    } else {
      if (icon) {
        style = [new olstyle.Style({
          image: new olstyle.Icon({
            src: icon,
            scale: scale
          })
        })];
      } else {
        style = [new olstyle.Style({
          image: new olstyle.Circle({
              radius: 2 * size + 3.4,
              stroke: new olstyle.Stroke({
                  color: 'black'
              }),
              fill: new olstyle.Fill({
                  color: 'blue'
              })
          })
        })];
      }
    }
    return style;
  }
}
