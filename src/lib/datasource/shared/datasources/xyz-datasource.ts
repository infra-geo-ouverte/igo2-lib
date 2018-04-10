import * as ol from 'openlayers';
import { Md5 } from 'ts-md5/dist/md5';

import { DataSource } from './datasource';
import { XYZDataSourceOptions } from './xyz-datasource.interface';



export class XYZDataSource extends DataSource {

  public options: XYZDataSourceOptions;
  public ol: ol.source.XYZ;

  protected createOlSource(): ol.source.XYZ {
    return new ol.source.XYZ(this.options);
  }

  protected generateId() {
    const chain = 'xyz' + this.options.url;

    return Md5.hashStr(chain) as string;
  }
}
