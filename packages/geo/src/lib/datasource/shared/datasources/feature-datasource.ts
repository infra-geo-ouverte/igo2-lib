import olSourceVector from 'ol/source/Vector';
import * as olformat from 'ol/format';

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

  protected getSourceFormatFromOptions(options: FeatureDataSourceOptions) {
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

  public onUnwatch() {}

  get queryTitle(): string {
    return (this.options as any).queryTitle
      ? (this.options as any).queryTitle
      : 'title';
  }
}
