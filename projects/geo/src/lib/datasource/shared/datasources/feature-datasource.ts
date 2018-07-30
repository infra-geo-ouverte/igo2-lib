import VectorSource from 'ol/source/Vector';
import { GeoJSON, KML, WKT, GPX, GML } from 'ol/format';

import { Md5 } from 'ts-md5';

import { uuid } from '@igo2/utils';
import { DataSource } from './datasource';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export class FeatureDataSource extends DataSource {
  static formats = { GeoJSON: GeoJSON, KML: KML, WKT: WKT, GPX: GPX, GML: GML };

  public options: FeatureDataSourceOptions;
  public ol: VectorSource;

  protected createOlSource(): VectorSource {
    const sourceOptions = {
      format: this.getSourceFormatFromOptions(this.options)
    };

    return new VectorSource(Object.assign(sourceOptions, this.options));
  }

  protected generateId() {
    if (!this.options.url) {
      return uuid();
    }
    const chain = 'feature' + this.options.url;
    return Md5.hashStr(chain) as string;
  }

  private getSourceFormatFromOptions(options: FeatureDataSourceOptions) {
    let olFormatCls;
    const formatType = options.formatType;
    if (!formatType) {
      olFormatCls = GeoJSON;
    } else {
      olFormatCls = FeatureDataSource.formats[formatType];
      if (olFormatCls === undefined) {
        throw new Error('Invalid vector source format ${formatType}.');
      }
    }

    const formatOptions = options.formatOptions;
    let format;
    if (formatOptions) {
      format = new olFormatCls(formatOptions);
    } else {
      format = new olFormatCls();
    }

    return format;
  }
}
