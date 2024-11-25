import olSourceXYZ from 'ol/source/XYZ';

import { DataSource } from './datasource';
import { XYZDataSourceOptions } from './xyz-datasource.interface';

export class XYZDataSource extends DataSource {
  public declare options: XYZDataSourceOptions;
  public declare ol: olSourceXYZ;

  protected createOlSource(): olSourceXYZ {
    return new olSourceXYZ(this.options);
  }

  public onUnwatch() {
    // empty
  }
}
