import * as ol from 'openlayers';
import { Md5 } from 'ts-md5/dist/md5';

import { createDefaultTileGrid } from '../../../utils/tilegrid';
import { DataSource } from './datasource';
import { WMTSDataSourceOptions } from './wmts-datasource.interface';


export class WMTSDataSource extends DataSource {

  public options: WMTSDataSourceOptions;
  public ol: ol.source.WMTS;

  constructor(options: WMTSDataSourceOptions) {
    super(options);
  }

  protected createOlSource(): ol.source.WMTS {
    const sourceOptions = Object.assign({
      tileGrid: createDefaultTileGrid(this.options.projection as string)
    }, this.options);

    return new ol.source.WMTS(sourceOptions);
  }

  protected generateId() {
    const layer = this.options.layer;
    const chain = 'wmts' + this.options.url + layer;

    return Md5.hashStr(chain) as string;
  }

}
