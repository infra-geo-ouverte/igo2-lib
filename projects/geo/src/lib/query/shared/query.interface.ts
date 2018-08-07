import { DataSource } from '../../datasource/shared/datasources/datasource';
import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

import { QueryFormat } from './query.enum';

export interface QueryOptions {
  coordinates: [number, number];
  projection: string;
  resolution?: number;
}

export interface QueryableDataSourceOptions extends DataSourceOptions {
  queryable?: boolean;
  queryFormat?: QueryFormat;
  queryTitle?: string;
  queryHtmlTarget?: string;
}

export interface QueryableDataSource extends DataSource {
  queryTitle?: string;
  queryHtmlTarget?: string;
  options: QueryableDataSourceOptions;
}
