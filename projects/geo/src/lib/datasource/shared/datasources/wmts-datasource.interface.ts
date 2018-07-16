import * as ol from 'openlayers';
import { DataSourceOptions, DataSourceContext } from './datasource.interface';

export interface WMTSDataSourceOptions
  extends DataSourceOptions,
    ol.olx.source.WMTSOptions {
  optionsFromCapabilities?: boolean;
}

export interface WMTSDataSourceContext
  extends DataSourceContext,
    WMTSDataSourceOptions {}
