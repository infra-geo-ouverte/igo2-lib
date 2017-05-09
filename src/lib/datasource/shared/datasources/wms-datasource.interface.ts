import { DataSourceContext,
         FilterableDataSourceOptions,
         QueryableDataSourceOptions } from './datasource.interface';

export interface WMSDataSourceOptions extends olx.source.ImageWMSOptions,
    FilterableDataSourceOptions, QueryableDataSourceOptions {

  optionsFromCapabilities?: boolean;
}

export interface WMSDataSourceContext extends DataSourceContext, WMSDataSourceOptions {}
