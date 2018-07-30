import { DataSourceOptions } from './datasource.interface';

export interface WMTSDataSourceOptions
  extends DataSourceOptions,
    ol.olx.source.WMTSOptions {
  optionsFromCapabilities?: boolean;
}
