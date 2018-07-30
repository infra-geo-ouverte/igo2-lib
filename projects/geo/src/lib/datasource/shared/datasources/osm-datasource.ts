import OSM from 'ol/source/OSM';

import { DataSource } from './datasource';
import { OSMDataSourceOptions } from './osm-datasource.interface';

export class OSMDataSource extends DataSource {
  public options: OSMDataSourceOptions;
  public ol: OSM;

  protected createOlSource(): OSM {
    this.options.url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    return new OSM(this.options);
  }

  protected generateId() {
    return 'OSM';
  }
}
