import { TimeFilterOptions, IgoOgcFilterObject } from '../../../filter';
import { QueryFormat, QueryOptions } from '../../../query';
import { MetadataOptions } from '../../../metadata';
import { DownloadOptions } from '../../../download';
import { DataSource } from './datasource';


export interface DataSourceOptions {
  title: string;
  alias?: string;
  legend?: DataSourceLegendOptions;
  metadata?: MetadataOptions;
  download?: DownloadOptions;
  view?: ol.olx.layer.ImageOptions;
}

export interface DataSourceContext extends DataSourceOptions {
  type: string;
}

export interface DataSourceLegendOptions {
  collapsed?: boolean;
  url?: string;
  html?: string;
  style?: {[key: string]: string | number};
  title?: string;
  display?: boolean;
}

export interface QueryableDataSourceOptions extends DataSourceOptions {
  queryable?: boolean;
  queryFormat?: QueryFormat;
  queryTitle?: string;
  queryHtmlTarget?: string;
}

export interface QueryableDataSource extends DataSource {
  queryFormat: QueryFormat;
  queryTitle?: string;
  queryHtmlTarget?: string;
  options: QueryableDataSourceOptions;
  getQueryUrl(options: QueryOptions): string;
}

export interface TimeFilterableDataSourceOptions extends DataSourceOptions,
    ol.olx.source.ImageWMSOptions {

  timeFilterable?: boolean;
  timeFilter?: TimeFilterOptions;
}

export interface TimeFilterableDataSource extends DataSource {
  options: TimeFilterableDataSourceOptions;
  filterByDate(date: Date | [Date, Date]);
}

export interface OgcFilterableDataSourceOptions extends DataSourceOptions,
    ol.olx.source.VectorOptions {

  ogcFilterable?: boolean;
  filters?: IgoOgcFilterObject;
}

export interface OgcFilterableDataSource extends DataSource {
  options: OgcFilterableDataSourceOptions;
  filterByOgc(IgoOgcFilterObject);
}
