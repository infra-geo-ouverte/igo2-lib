import olSourceTileArcGISRest from 'ol/source/TileArcGISRest';

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

  ol?: olSourceTileArcGISRest;
  idColumn?: string;
}
