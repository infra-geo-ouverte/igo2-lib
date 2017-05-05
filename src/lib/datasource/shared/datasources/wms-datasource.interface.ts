import { FilterableDataSourceOptions, QueryableDataSourceOptions } from './datasource.interface';

export interface WMSDataSourceOptions extends olx.source.ImageWMSOptions,
  FilterableDataSourceOptions, QueryableDataSourceOptions {

  optionsFromCapabilities?: boolean;
}
