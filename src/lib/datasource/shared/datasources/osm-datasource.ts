
import OSM from 'ol/source/osm';
import { DataSource } from './datasource';
import { OSMDataSourceOptions } from './osm-datasource.interface';


export class OSMDataSource extends DataSource {

  public options: OSMDataSourceOptions;
  public ol: OSM;

  protected createOlSource(): ol.source.OSM {
   return new OSM(this.options);
  }

  protected generateId() {
    return 'OSM';
  }
}
