import { Md5 } from 'ts-md5';
import olSourceWMTS from 'ol/source/WMTS';

import { SubjectStatus} from '@igo2/utils';
import { createDefaultTileGrid } from '../../utils/tilegrid';
import { DataSource } from './datasource';
import { WMTSDataSourceOptions } from './wmts-datasource.interface';

export class WMTSDataSource extends DataSource {
  public options: WMTSDataSourceOptions;
  public ol: olSourceWMTS;

  constructor(options: WMTSDataSourceOptions) {
    super(options);
  }

  protected createOlSource(): olSourceWMTS {
    const sourceOptions = Object.assign(
      {
        tileGrid: createDefaultTileGrid(this.options.projection as string)
      },
      this.options
    );

    return new olSourceWMTS(sourceOptions);
  }

  protected generateId() {
    const layer = this.options.layer;
    const chain = 'wmts' + this.options.url + layer;

    return Md5.hashStr(chain) as string;
  }

  onLayerStatusChange(status: SubjectStatus): void{
    switch(status) {
      case 1:
      case 2:
      case 3:
      case 4:
        // nothing to do
        break;
      default:
        break;
    }
  }
}
