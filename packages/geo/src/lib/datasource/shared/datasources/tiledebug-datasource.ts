import TileDebug from 'ol/source/TileDebug';
import TileGrid from 'ol/tilegrid/TileGrid';

import { DataSource } from './datasource';
import { TileDebugDataSourceOptions } from './tiledebug-datasource.interface';

export class TileDebugDataSource extends DataSource {
  public declare options: TileDebugDataSourceOptions;
  public declare ol: TileDebug;

  protected createOlSource(): TileDebug {
    const baseOptions = JSON.parse(JSON.stringify(this.options)); // to avoid to alter the original options
    if (this.options.tileGrid) {
      delete baseOptions.tileGrid;
      baseOptions.tileGrid = new TileGrid(this.options.tileGrid);
    }
    return new TileDebug(baseOptions);
  }

  public onUnwatch() {}
}
