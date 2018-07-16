import * as ol from 'openlayers';
import {
  DataSourceContext,
  TimeFilterableDataSourceOptions,
  QueryableDataSourceOptions,
  OgcFilterableDataSourceOptions
} from './datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';

export interface WMSDataSourceOptions
  extends ol.olx.source.ImageWMSOptions,
    TimeFilterableDataSourceOptions,
    QueryableDataSourceOptions,
    OgcFilterableDataSourceOptions {
  optionsFromCapabilities?: boolean;
  wfsSource?: WFSDataSourceOptions;
}

export interface WMSDataSourceContext
  extends DataSourceContext,
    WMSDataSourceOptions {}
