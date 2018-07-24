import * as ol from 'openlayers';
import {
  DataSourceContext,
  DataSourceOptions
  // TimeFilterableDataSourceOptions,
  // QueryableDataSourceOptions
  // OgcFilterableDataSourceOptions
} from './datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';

export interface WMSDataSourceOptions
  extends ol.olx.source.ImageWMSOptions,
    DataSourceOptions {
  // QueryableDataSourceOptions {
  // OgcFilterableDataSourceOptions
  // TimeFilterableDataSourceOptions,
  optionsFromCapabilities?: boolean;
  wfsSource?: WFSDataSourceOptions;
}

export interface WMSDataSourceContext
  extends DataSourceContext,
    WMSDataSourceOptions {}
