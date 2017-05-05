import { DataSourceOptions } from './datasource.interface';

export interface WMTSDataSourceOptions extends DataSourceOptions, olx.source.WMTSOptions {
  optionsFromCapabilities?: boolean;
}
