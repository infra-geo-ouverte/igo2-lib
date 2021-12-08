import { Injectable } from '@angular/core';

import * as olstyle from 'ol/style';
import OlFeature from 'ol/Feature';
import { StyleByAttribute } from './vector-style.interface';

import { ClusterParam } from './clusterParam';
import { createOverlayMarkerStyle } from '../../overlay/shared/overlay-marker-style.utils';

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  public style: olstyle.Style;

  createStyle(options: { [key: string]: any }) {
    if (!options) {
      return createOverlayMarkerStyle();
    }
    if (typeof options === 'function' || options instanceof olstyle.Style) {
      return options;
    }
    return this.parseStyle('style', options);
  }

  private parseStyle(key: string, value: any) {
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
    const type = styleByAttribute.type ? styleByAttribute.type : this.guessTypeFeature(feature);
    const attribute = styleByAttribute.attribute;
    const data = styleByAttribute.data;
    const stroke = styleByAttribute.stroke;
    const width = styleByAttribute.width;
    const fill = styleByAttribute.fill;
    const anchor = styleByAttribute.anchor;
    const radius = styleByAttribute.radius;
    const icon = styleByAttribute.icon;
    const scale = styleByAttribute.scale;
    const size = data ? data.length : 0;
    const label = styleByAttribute.label;
    const labelStyle = label instanceof olstyle.Style ?
      this.parseStyle('text', styleByAttribute.label) ||
      new olstyle.Text() : undefined;
    const baseStyle = styleByAttribute.baseStyle;

    if (labelStyle) {
      const options = {
        text: this.getLabel(feature, label)
      };

      labelStyle instanceof olstyle.Style ? labelStyle.setText(new olstyle.Text(options)) :
      labelStyle.setText(this.getLabel(feature, label));
    }

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
                  color: fill ? fill[i] : undefined,
                  src: icon[i],
                  scale: scale ? scale[i] : 1,
                  anchor: anchor ? anchor[i] : [0.5, 0.5],
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
                  color: stroke ? stroke[i] : 'black',
                  width: width ? width[i] : 1
                }),
                fill: new olstyle.Fill({
                  color: fill ? fill[i] : 'black'
                })
              }),
              text: labelStyle instanceof olstyle.Text ? labelStyle : undefined
            })
          ];
          return style;
        }
      }
      if (!feature.getStyle()) {
        if (baseStyle) {
          style = this.createStyle(baseStyle);
          if (labelStyle) {
            style.setText(labelStyle);
          }
          return style;
        }
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
              text: labelStyle instanceof olstyle.Text ? labelStyle : undefined
            })
          ];
          return style;
        }
      }
      if (feature instanceof OlFeature) {
        if (!feature.getStyle()) {
          if (baseStyle) {
            style = this.createStyle(baseStyle);
            if (labelStyle) {
              style.setText(labelStyle);
            }
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
  }

  createClusterStyle(feature, clusterParam: ClusterParam = {}, layerStyle) {
    let style;
    const size = feature.get('features').length;
    if (size !== 1) {
      if (clusterParam.clusterRanges) {
        for (const r of clusterParam.clusterRanges) {
          if (
            (!r.minRadius || r.minRadius <= size) &&
            (!r.maxRadius || r.maxRadius >= size)
          ) {
            style = this.createStyle(r.style) as olstyle.Circle;

            if (r.showRange) {
              const text = new olstyle.Text({
                text: size.toString(),
                fill: new olstyle.Fill({
                  color: '#fff'
                })
              });
              style.setText(text);
            }

            if (r.dynamicRadius) {
              let clusterRadius: number;
              const radiusMin = style.getRadius();
              clusterRadius = 5 * Math.log(size);
              if (clusterRadius < radiusMin) {
                clusterRadius = radiusMin;
              }
              style.image_.setRadius(clusterRadius);
            }
            break;
          }
        }
      }

      if (!style) {
        let clusterRadius: number;
        if (clusterParam.radiusCalc) {
          clusterRadius = clusterParam.radiusCalc(size);
        } else {
          const radiusMin = 6;
          clusterRadius = 5 * Math.log(size);
          if (clusterRadius < radiusMin) {
            clusterRadius = radiusMin;
          }
        }

        style = [
          new olstyle.Style({
            image: new olstyle.Circle({
              radius: clusterRadius,
              stroke: new olstyle.Stroke({
                color: 'black'
              }),
              fill: new olstyle.Fill({
                color: 'rgba(24, 134, 45, 0.5)'
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
      }
    } else {
      style = this.createStyle(layerStyle);
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

  private guessTypeFeature(feature) {
    switch (feature.getGeometry().getType()) {
      case 'Point':
      case 'MultiPoint':
      case 'Circle':
        return 'circle';
      default:
        return 'regular';
    }
  }
}
