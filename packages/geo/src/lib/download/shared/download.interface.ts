import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

export interface DownloadOptions {
  url: string;
  dynamicUrl?: string;
  extern?: boolean;
}

export interface DownloadDataSourceOptions {
  download?: DownloadOptions;
}
