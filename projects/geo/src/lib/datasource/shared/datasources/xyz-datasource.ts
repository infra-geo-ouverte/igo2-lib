import { Md5 } from 'ts-md5';
import olSourceXYZ from 'ol/source/XYZ';


import { SubjectStatus} from '@igo2/utils';
import { DataSource } from './datasource';
import { XYZDataSourceOptions } from './xyz-datasource.interface';

export class XYZDataSource extends DataSource {
  public options: XYZDataSourceOptions;
  public ol: olSourceXYZ;

  protected createOlSource(): olSourceXYZ {
    return new olSourceXYZ(this.options);
  }

  protected generateId() {
    const chain = 'xyz' + this.options.url;

    return Md5.hashStr(chain) as string;
  }

  onLayerStatusChange(status: SubjectStatus): void {}
}
