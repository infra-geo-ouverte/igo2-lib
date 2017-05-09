import { DataSource } from './datasource';
import { FeatureDataSourceOptions } from './feature-datasource.interface';


export class FeatureDataSource extends DataSource {

  public options: FeatureDataSourceOptions;
  public ol: ol.source.Vector;

  protected createOlSource(): ol.source.Vector {
    const sourceOptions = {
      format: this.getSourceFormatFromOptions(this.options)
    };

    return new ol.source.Vector(Object.assign(sourceOptions, this.options));
  }

  protected generateId() {
    return undefined;
  }

  private getSourceFormatFromOptions(options: FeatureDataSourceOptions) {
    let olFormatCls;
    const formatType = options.formatType;
    if (!formatType) {
      olFormatCls = ol.format.GeoJSON;
    } else {
      olFormatCls = ol.format[formatType];
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
