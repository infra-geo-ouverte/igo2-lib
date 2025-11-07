import { DataSourceOptions } from './datasource.interface';

export interface CartoDataSourceOptions extends DataSourceOptions {
  // type?: 'carto';
  account: string;
  mapId?: string; // Fetch the config of a public map from the Carto API using the mapId.

  params?: any;
  queryPrecision?: string;
  crossOrigin?: string;
  projection?: string;
  config?: any;
  map?: string;
}
