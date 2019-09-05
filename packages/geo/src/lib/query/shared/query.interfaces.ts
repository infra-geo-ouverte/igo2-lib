import { DataSource } from '../../datasource/shared/datasources/datasource';
import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

import { QueryFormat, QueryHtmlTarget } from './query.enums';

export interface QueryOptions {
  coordinates: [number, number];
  projection: string;
  resolution?: number;
}

export interface QueryableDataSourceOptions extends DataSourceOptions {
  queryable?: boolean;
  queryFormat?: QueryFormat;
  queryTitle?: string;
  mapLabel?: string;
  queryHtmlTarget?: QueryHtmlTarget;
}

export interface QueryableDataSource extends DataSource {
  queryTitle?: string;
  mapLabel?: string;
  queryHtmlTarget?: QueryHtmlTarget;
  options: QueryableDataSourceOptions;
}
