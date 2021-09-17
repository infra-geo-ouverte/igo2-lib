import { DataSource } from '../../datasource/shared/datasources/datasource';
import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

import { QueryFormat, QueryHtmlTarget } from './query.enums';

import olSource from 'ol/source/Source';
import olSourceVector from 'ol/source/Vector';
import type { default as OlGeometry } from 'ol/geom/Geometry';

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
  ol?: olSourceVector<OlGeometry> | olSource;
}

export interface QueryableDataSource extends DataSource {
  queryTitle?: string;
  mapLabel?: string;
  queryHtmlTarget?: QueryHtmlTarget;
  options: QueryableDataSourceOptions;
}
