import { Injectable } from '@angular/core';

import OlFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import RenderFeature from 'ol/render/Feature';
import * as olStyle from 'ol/style';

import { ClusterParam } from '../../layer/shared/clusterParam';
import { getResolutionFromScale } from '../../map/shared/map.utils';
import { createOverlayMarkerStyle } from '../shared/overlay/overlay-marker-style.utils';
import { StyleByAttribute } from '../shared/vector/vector-style.interface';

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  public style: olStyle.Style;

  /**
   * Create a style based on a object as
   * style: {
   *       "stroke": {
   *         "color": "blue",
   *         "lineDash": [10, 5]
   *       },
   *       "text": {
   *         "minScaleDenom": 50000,
   *         "maxScaleDenom": 200000,
   *         "minResolution": 100,
   *         "maxResolution": 400,
   *         "attribute": "THE COLUMN NAME TO RETRIEVE THE LABEL VALUE",
   *         "text": "MY HARCODED TEXT",
   *         "stroke": {
   *           "color": "blue",
   *           "width": 0.75
   *         },
   *         "fill": {
   *           "color": "black"
   *         },
   *         "font": "20px sans-serif",
   *         "overflow": true,
   *         "offsetX": 10,
   *         "offsetY": 20,
   *         "padding": [2.5, 2.5, 2.5, 2.5]
   *       },
   *       "width": 5
   *     }
   *
   * @param options
   * @param feature feature to apply style on
   * @param resolution current map resolution, to control label resolution range
   * @returns
   */
  createStyle(
    options: { [key: string]: any },
    feature?: RenderFeature | OlFeature<OlGeometry>,
    resolution?: number
  ) {
    if (!options) {
      return createOverlayMarkerStyle();
    }
    if (typeof options === 'function' || options instanceof olStyle.Style) {
      return options;
    }
    const parsedStyle = this.parseStyle('style', options);
    if (parsedStyle.getText()) {
      let labelMinResolution = 0;
      let labelMaxResolution = Infinity;
      if (options.text) {
        const labelMinResolutionFromScale = options.text?.minScaleDenom
          ? getResolutionFromScale(Number(options.text.minScaleDenom))
          : undefined;
        const labelMaxResolutionFromScale = options.text?.maxScaleDenom
          ? getResolutionFromScale(Number(options.text.maxScaleDenom))
          : undefined;
        const minResolution = options.text?.minResolution
          ? options.text.minResolution
          : 0;
        const maxResolution = options.text?.maxResolution
          ? options.text.maxResolution
          : Infinity;

        labelMinResolution = labelMinResolutionFromScale || minResolution;
        labelMaxResolution = labelMaxResolutionFromScale || maxResolution;
      }
      if (
        options.text?.minScaleDenom ||
        options.text?.maxScaleDenom ||
        options.text?.minResolution ||
        options.text?.maxResolution
      ) {
        if (
          feature &&
          resolution >= labelMinResolution &&
          resolution <= labelMaxResolution
        ) {
          if (feature && options.text.attribute) {
            parsedStyle
              .getText()
              .setText(this.getLabel(feature, options.text.attribute));
          }
        } else {
          parsedStyle.setText();
        }
      }
    }
    return parsedStyle;
  }

  public parseStyle(key: string, value: any) {
    const styleOptions = {};
    const olCls = this.getOlCls(key);

    if (olCls && value instanceof Object) {
      Object.keys(value).forEach((_key) => {
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
    let olCls = olStyle[key.charAt(0).toUpperCase() + key.slice(1)];
    if (key === 'regularshape') {
      olCls = olStyle.RegularShape;
    }
    if (key === 'backgroundFill') {
      olCls = olStyle.Fill;
    }
    if (key === 'backgroundStroke') {
      olCls = olStyle.Stroke;
    }

    return olCls;
  }

  createStyleByAttribute(
    feature: RenderFeature | OlFeature<OlGeometry>,
    styleByAttribute: StyleByAttribute,
    resolution: number
  ) {
    let style;
    const type = styleByAttribute.type
      ? styleByAttribute.type
      : this.guessTypeFeature(feature);
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
    const label = styleByAttribute.label
      ? styleByAttribute.label.attribute
      : undefined;
    const labelMinResolutionFromScale = styleByAttribute.label?.minScaleDenom
      ? getResolutionFromScale(Number(styleByAttribute.label.minScaleDenom))
      : undefined;
    const labelMaxResolutionFromScale = styleByAttribute.label?.maxScaleDenom
      ? getResolutionFromScale(Number(styleByAttribute.label.maxScaleDenom))
      : undefined;
    const minResolution = styleByAttribute.label?.minResolution
      ? styleByAttribute.label.minResolution
      : 0;
    const maxResolution = styleByAttribute.label?.maxResolution
      ? styleByAttribute.label.maxResolution
      : Infinity;

    const labelMinResolution = labelMinResolutionFromScale || minResolution;
    const labelMaxResolution = labelMaxResolutionFromScale || maxResolution;

    let labelStyle = styleByAttribute.label?.style
      ? this.parseStyle('text', styleByAttribute.label.style)
      : undefined;
    if (!labelStyle && label) {
      labelStyle = new olStyle.Text();
    }
    const baseStyle = styleByAttribute.baseStyle;

    if (labelStyle) {
      if (
        resolution >= labelMinResolution &&
        resolution <= labelMaxResolution
      ) {
        labelStyle.setText(this.getLabel(feature, label));
      } else {
        labelStyle.setText('');
      }
    }

    if (type === 'circle') {
      for (let i = 0; i < size; i++) {
        const val =
          typeof feature.get(attribute) !== 'undefined' &&
          feature.get(attribute) !== null
            ? feature.get(attribute)
            : '';
        if (
          val === data[i] ||
          val.toString().match(new RegExp(data[i], 'gmi'))
        ) {
          if (icon) {
            style = [
              new olStyle.Style({
                image: new olStyle.Icon({
                  color: fill ? fill[i] : undefined,
                  src: icon[i],
                  scale: scale ? scale[i] : 1,
                  anchor: anchor ? anchor[i] : [0.5, 0.5]
                }),
                text:
                  labelStyle instanceof olStyle.Text ? labelStyle : undefined
              })
            ];
            return style;
          }
          style = [
            new olStyle.Style({
              image: new olStyle.Circle({
                radius: radius ? radius[i] : 4,
                stroke: new olStyle.Stroke({
                  color: stroke ? stroke[i] : 'black',
                  width: width ? width[i] : 1
                }),
                fill: new olStyle.Fill({
                  color: fill ? fill[i] : 'black'
                })
              }),
              text: labelStyle instanceof olStyle.Text ? labelStyle : undefined
            })
          ];
          return style;
        }
      }
      if (!(feature as OlFeature<OlGeometry>).getStyle()) {
        if (baseStyle) {
          style = this.createStyle(baseStyle, feature, resolution);
          if (labelStyle) {
            style.setText(labelStyle);
          }
          return style;
        }
        style = [
          new olStyle.Style({
            image: new olStyle.Circle({
              radius: 4,
              stroke: new olStyle.Stroke({
                color: 'black'
              }),
              fill: new olStyle.Fill({
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
          typeof feature.get(attribute) !== 'undefined' &&
          feature.get(attribute) !== null
            ? feature.get(attribute)
            : '';
        if (
          val === data[i] ||
          val.toString().match(new RegExp(data[i], 'gmi'))
        ) {
          style = [
            new olStyle.Style({
              stroke: new olStyle.Stroke({
                color: stroke ? stroke[i] : 'black',
                width: width ? width[i] : 1
              }),
              fill: new olStyle.Fill({
                color: fill ? fill[i] : 'rgba(255,255,255,0.4)'
              }),
              text: labelStyle instanceof olStyle.Text ? labelStyle : undefined
            })
          ];
          return style;
        }
      }
      if (feature instanceof OlFeature) {
        if (!feature.getStyle()) {
          if (baseStyle) {
            style = this.createStyle(baseStyle, feature, resolution);
            if (labelStyle) {
              style.setText(labelStyle);
            }
            return style;
          }
          style = [
            new olStyle.Style({
              stroke: new olStyle.Stroke({
                color: 'black'
              }),
              fill: new olStyle.Fill({
                color: '#bbbbf2'
              })
            })
          ];
          return style;
        }
      }
    }
  }

  createClusterStyle(
    feature: RenderFeature | OlFeature<OlGeometry>,
    resolution: number,
    clusterParam: ClusterParam = {},
    layerStyle
  ) {
    let style;
    const size = feature.get('features').length;
    if (size !== 1) {
      if (clusterParam.clusterRanges) {
        for (const r of clusterParam.clusterRanges) {
          if (
            (!r.minRadius || r.minRadius <= size) &&
            (!r.maxRadius || r.maxRadius >= size)
          ) {
            style = this.createStyle(r.style) as olStyle.Circle;

            if (r.showRange) {
              const text = new olStyle.Text({
                text: size.toString(),
                fill: new olStyle.Fill({
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
          new olStyle.Style({
            image: new olStyle.Circle({
              radius: clusterRadius,
              stroke: new olStyle.Stroke({
                color: 'black'
              }),
              fill: new olStyle.Fill({
                color: 'rgba(24, 134, 45, 0.5)'
              })
            }),
            text: new olStyle.Text({
              text: size.toString(),
              fill: new olStyle.Fill({
                color: '#fff'
              })
            })
          })
        ];
      }
    } else {
      style = this.createStyle(layerStyle, feature, resolution);
    }
    return style;
  }

  getLabel(feature, labelMatch): string {
    let label = labelMatch;
    if (!label) {
      return;
    }
    const labelToGet = Array.from(labelMatch.matchAll(/\$\{([^\{\}]+)\}/g));

    labelToGet.forEach((v) => {
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
