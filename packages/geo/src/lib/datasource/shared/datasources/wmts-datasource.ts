import { Options } from 'ol/source/WMTS';
import olSourceWMTS from 'ol/source/WMTS';

import { createDefaultTileGrid } from '../../utils/tilegrid';
import { DataSource } from './datasource';
import { WMTSDataSourceOptions } from './wmts-datasource.interface';

export class WMTSDataSource extends DataSource {
  public declare options: WMTSDataSourceOptions;
  public declare ol: olSourceWMTS;

  constructor(options: WMTSDataSourceOptions) {
    super(options);
  }

  protected createOlSource(): olSourceWMTS {
    const sourceOptions = Object.assign(
      {
        tileGrid: createDefaultTileGrid(this.options.projection as string)
      },
      this.options
    ) as Options;

    return new olSourceWMTS(sourceOptions);
  }

  public onUnwatch() {
    // empty
  }
}
