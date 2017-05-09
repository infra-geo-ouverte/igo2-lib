import { DataSourceOptions, DataSourceContext } from './datasource.interface';

export interface WMTSDataSourceOptions extends DataSourceOptions, olx.source.WMTSOptions {
  optionsFromCapabilities?: boolean;
}

export interface WMTSDataSourceContext extends DataSourceContext, WMTSDataSourceOptions {}
