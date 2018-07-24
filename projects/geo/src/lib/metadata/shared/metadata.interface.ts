import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

export interface MetadataOptions {
  url: string;
  extern?: boolean;
}

export interface MetadataDataSourceOptions extends DataSourceOptions {
  metadata?: MetadataOptions;
}
