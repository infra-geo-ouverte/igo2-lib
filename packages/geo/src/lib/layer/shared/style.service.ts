import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material';

import * as olstyle from 'ol/style';
import { StyleByAttribute } from './vector-style.interface';

import { ClusterParam } from './clusterParam';
import { createOverlayMarkerStyle } from '../../overlay';

@Injectable({
  providedIn: 'root'
})
export class StyleService {

  public style: olstyle.Style;

  constructor(private matIconRegistry: MatIconRegistry) {}

  createStyle(options: { [key: string]: any }) {
    if (typeof options === 'function' || options instanceof olstyle.Style) {
      return options;
    }
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
    let olKey;
    switch (key.toLowerCase()) {
      case 'circle':
      case 'regularshape':
      case 'icon':
        olKey = 'image';
        break;
      default:
        break;
    }

    return olKey || key;
  }

  private getOlCls(key: any) {
    let olCls = olstyle[key.charAt(0).toUpperCase() + key.slice(1)];
    if (key === 'regularshape') {
      olCls = olstyle.RegularShape;
    }
    if (key === 'backgroundFill') {
      olCls = olstyle.Fill;
    }
    if (key === 'backgroundStroke') {
      olCls = olstyle.Stroke;
    }

    return olCls;
  }
  createStyleByAttribute(feature, styleByAttribute: StyleByAttribute) {
    let style;
    const type = styleByAttribute.type;
    const attribute = styleByAttribute.attribute;
    const data = styleByAttribute.data;
    const stroke = styleByAttribute.stroke;
    const width = styleByAttribute.width;
    const fill = styleByAttribute.fill;
    const radius = styleByAttribute.radius;
    const icon = styleByAttribute.icon;
    const scale = styleByAttribute.scale;
    const size = data.length;
    const label = styleByAttribute.label.attribute || styleByAttribute.label;
    const labelStyle =
      this.parseStyle('text', styleByAttribute.label.style) ||
      new olstyle.Text();
    labelStyle.setText(this.getLabel(feature, label));
    const baseStyle = styleByAttribute.baseStyle;
    if (type === 'circle') {
      for (let i = 0; i < size; i++) {
        const val =
          typeof feature.get(attribute) !== 'undefined'
            ? feature.get(attribute)
            : '';
        if (val === data[i] || val.toString().match(data[i])) {
          if (icon) {
            style = [
              new olstyle.Style({
                image: new olstyle.Icon({
                  src: icon[i],
                  scale: scale ? scale[i] : 1
                })
              })
            ];
            return style;
          }
          style = [
            new olstyle.Style({
              image: new olstyle.Circle({
                radius: radius ? radius[i] : 4,
                stroke: new olstyle.Stroke({
                  color: stroke ? stroke[i] : 'black'
                }),
                fill: new olstyle.Fill({
                  color: fill ? fill[i] : 'black'
                })
              }),
              text: labelStyle
            })
          ];
          return style;
        }
      }
      if (!feature.getStyle()) {
        style = [
          new olstyle.Style({
            image: new olstyle.Circle({
              radius: 4,
              stroke: new olstyle.Stroke({
                color: 'black'
              }),
              fill: new olstyle.Fill({
                color: '#bbbbf2'
              })
            })
          })
        ];
        return style;
      }
    } else if (type === 'regular') {
      for (let i = 0; i < size; i++) {
        const val =
          typeof feature.get(attribute) !== 'undefined'
            ? feature.get(attribute)
            : '';
        if (val === data[i] || val.toString().match(data[i])) {
          style = [
            new olstyle.Style({
              stroke: new olstyle.Stroke({
                color: stroke ? stroke[i] : 'black',
                width: width ? width[i] : 1
              }),
              fill: new olstyle.Fill({
                color: fill ? fill[i] : 'rgba(255,255,255,0.4)'
              }),
              text: labelStyle
            })
          ];
          return style;
        }
      }
      if (!feature.getStyle()) {
        if (baseStyle) {
          style = this.createStyle(baseStyle);
          return style;
        }
        style = [
          new olstyle.Style({
            stroke: new olstyle.Stroke({
              color: 'black'
            }),
            fill: new olstyle.Fill({
              color: '#bbbbf2'
            })
          })
        ];
        return style;
      }
    }
  }

  createClusterStyle(feature, clusterParam: ClusterParam, layerStyle) {
    let style;
    // const maxSize = 100;
    const range = clusterParam.clusterRange;
    const size = feature.get('features').length;
    const color = 'rgba(24, 134, 45, 0.8)';
    if (size !== 1) {
      // if (range) {
      //   if (size >= range[1]) {
      //     color = 'red';
      //   } else if (size < range[1] && size >= range[0]) {
      //     color = 'orange';
      //   } else if (size < range[0]) {
      //     color = 'green';
      //   }
      // }
      style = [
        new olstyle.Style({
          image: new olstyle.Circle({
            radius: 5 * Math.log(size),
            opacity: 0.4,
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
        })
      ];
    } else {
      if (!feature.values_.features[0].icon) {
        style = createOverlayMarkerStyle();
      } else {
        let icon = feature.values_.features[0].icon;
        this.matIconRegistry.getNamedSvgIcon(icon).subscribe(svgObj => {
          const xmlSerializer = new XMLSerializer();
          svgObj.setAttribute('width', '30');
          svgObj.setAttribute('height', '30');
          svgObj.setAttribute('fill', 'rgba(0, 128, 255)');
          svgObj.setAttribute('stroke', 'white');
          const svg = xmlSerializer.serializeToString(svgObj);
          let clusterStyle = new olstyle.Style ({
            image: new olstyle.Icon({
              src: 'data:image/svg+xml;utf8,' + svg
            })
          })
          this.style = clusterStyle;
        });
        style = this.style;
      }
    }
    return style;
  }

  getLabel(feature, labelMatch): string {
    let label = labelMatch;
    const labelToGet = Array.from(labelMatch.matchAll(/\$\{([^\{\}]+)\}/g));

    labelToGet.forEach(v => {
      label = label.replace(v[0], feature.get(v[1]));
    });

    // Nothing done? check feature's attribute
    if (labelToGet.length === 0 && label === labelMatch) {
      label = feature.get(labelMatch) || labelMatch;
    }

    return label;
  }
}
