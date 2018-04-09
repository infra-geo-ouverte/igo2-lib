import { DataSource } from './datasource';
import { OSMDataSourceOptions } from './osm-datasource.interface';
import ol = require('openlayers');

export class OSMDataSource extends DataSource {

  public options: OSMDataSourceOptions;
  public ol: ol.source.OSM;

  protected createOlSource(): ol.source.OSM {
   return new ol.source.OSM(this.options);
  }

  protected generateId() {
    return 'OSM';
  }
}
