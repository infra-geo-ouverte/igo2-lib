import { DataSourceOptions } from './datasource.interface';

export interface TileArcGISRestDataSourceOptions extends DataSourceOptions {
  // type?: 'tilearcgisrest';
  queryPrecision?: number;
  layer?: string;
  legendInfo?: any;

  params?: any;
  attributions?: string | string[];
  projection?: string;
  url?: string;
  urls?: string[];

  idColumn?: string;
}
