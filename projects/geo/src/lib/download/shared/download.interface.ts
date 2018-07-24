import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

export interface DownloadOptions {
  url: string;
  extern?: boolean;
}

export interface DownloadDataSourceOptions extends DataSourceOptions {
  download?: DownloadOptions;
}
