import XYZ from 'ol/source/xyz';
import { Md5 } from 'ts-md5/dist/md5';

import { DataSource } from './datasource';
import { XYZDataSourceOptions } from './xyz-datasource.interface';


export class XYZDataSource extends DataSource {

  public options: XYZDataSourceOptions;
  public ol: XYZ;

  protected createOlSource(): XYZ {
    return new XYZ(this.options);
  }

  protected generateId() {
    const chain = 'xyz' + this.options.url;

    return Md5.hashStr(chain) as string;
  }
}
