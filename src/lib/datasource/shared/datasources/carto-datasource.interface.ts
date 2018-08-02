import * as ol from 'openlayers';

import {
  DataSourceOptions,
  DataSourceContext,
  QueryableDataSourceOptions
} from './datasource.interface';

export interface CartoDataSourceOptions
  extends DataSourceOptions,
    ol.olx.source.CartoDBOptions,
    QueryableDataSourceOptions {
  queryPrecision?: string;
}

export interface CartoDataSourceContext extends DataSourceContext {}
