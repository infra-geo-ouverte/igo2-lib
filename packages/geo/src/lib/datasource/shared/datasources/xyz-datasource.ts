import olSourceXYZ from 'ol/source/XYZ';

import { DataSource } from './datasource';
import { XYZDataSourceOptions } from './xyz-datasource.interface';

export class XYZDataSource extends DataSource {
  public options: XYZDataSourceOptions;
  public ol: olSourceXYZ;

  protected createOlSource(): olSourceXYZ {
    return new olSourceXYZ(this.options);
  }

  public onUnwatch() {}

}
