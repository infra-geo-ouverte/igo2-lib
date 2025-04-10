import olSourceOSM from 'ol/source/OSM';

import { DataSource } from './datasource';
import { OSMDataSourceOptions } from './osm-datasource.interface';

export class OSMDataSource extends DataSource {
  declare public options: OSMDataSourceOptions;
  declare public ol: olSourceOSM;

  protected createOlSource(): olSourceOSM {
    if (!this.options.url) {
      this.options.url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    return new olSourceOSM(this.options);
  }

  public onUnwatch() {
    // empty
  }
}
