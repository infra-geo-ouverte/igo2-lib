import olSourceVector from 'ol/source/Vector';
import * as olformat from 'ol/format';

import { Md5 } from 'ts-md5';

import { uuid } from '@igo2/utils';
import { DataSource } from './datasource';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export class FeatureDataSource extends DataSource {
  public options: FeatureDataSourceOptions;
  public ol: olSourceVector;

  protected createOlSource(): olSourceVector {
    const sourceOptions = {
      format: this.getSourceFormatFromOptions(this.options)
    };

    return new olSourceVector(Object.assign(sourceOptions, this.options));
  }

  protected generateId() {
    if (!this.options.url) {
      return uuid();
    }
    const chain = 'feature' + this.options.url;
    return Md5.hashStr(chain) as string;
  }

  private getSourceFormatFromOptions(options: FeatureDataSourceOptions) {
    if (options.format) {
      return options.format;
    }
    let olFormatCls;
    const formatType = options.formatType;
    if (!formatType) {
      olFormatCls = olformat.GeoJSON;
    } else {
      olFormatCls = olformat[formatType];
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
