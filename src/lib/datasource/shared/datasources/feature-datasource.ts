import Vector from 'ol/source/vector';
import GeoJSON from 'ol/format/geojson';
import KML from 'ol/format/kml';
import { Md5 } from 'ts-md5/dist/md5';

import { uuid } from '../../../utils';
import { DataSource } from './datasource';
import { FeatureDataSourceOptions } from './feature-datasource.interface';


export class FeatureDataSource extends DataSource {

  public options: FeatureDataSourceOptions;
  public ol: Vector;

  protected createOlSource(): Vector {
    const sourceOptions = {
      format: this.getSourceFormatFromOptions(this.options)
    };

    return new Vector(Object.assign(sourceOptions, this.options));
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
    const formatType =
    options.formatType === undefined ? undefined : options.formatType.toLowerCase();
    // Only geojson & kml supported
    if (formatType) {
      switch (formatType) {
        case 'geojson':
          olFormatCls = GeoJSON;
          break;
        case 'kml':
          olFormatCls = KML;
          break;
        default:
          console.log('Invalid vector source format.');
          break;
        }
       } else {
          return;
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
