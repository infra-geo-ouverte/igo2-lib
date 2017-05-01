import { Layer } from './layer';
import { VectorLayerOptions,
         VectorLayerSource } from './layer-vector.interface';


export class VectorLayer extends Layer {

  public options: VectorLayerOptions;
  public olLayer: ol.layer.Vector;

  protected createOlLayer(): ol.layer.Vector {
    const sourceOptions = {};
    if (this.options.source) {
      sourceOptions['format'] = this.getSourceFormatFromOptions(this.options.source);
    }

    const sourceStyle = this.getSourceStyleFromOptions(this.options);
    Object.assign(sourceOptions, this.options.source);

    const WFSLayerOptions = Object.assign(this.options.view || {}, {
      style: sourceStyle,
      source: new ol.source.Vector(sourceOptions)
    });

    return new ol.layer.Vector(WFSLayerOptions);
  }

  protected generateId() {
    return undefined;
  }

  private getSourceFormatFromOptions(sourceOptions: VectorLayerSource) {
    let olFormatCls;
    const formatType = sourceOptions.formatType;
    if (!formatType) {
      olFormatCls = new ol.format.GeoJSON();
    } else {
      olFormatCls = ol.format[formatType];
      if (olFormatCls === undefined) {
        throw new Error('Invalid vector source format ${formatType}.');
      }
    }

    const formatOptions = sourceOptions.formatOptions;
    let format;
    if (formatOptions) {
      format = new olFormatCls(formatOptions);
    } else {
      format = new olFormatCls();
    }

     return format;
  }

  private getSourceStyleFromOptions(options: VectorLayerOptions) {
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
