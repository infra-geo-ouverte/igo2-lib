import * as ol from 'openlayers';
import { DataSourceOptions } from './datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';

export interface WMSDataSourceOptions
  extends ol.olx.source.ImageWMSOptions,
    DataSourceOptions {
  optionsFromCapabilities?: boolean;
  wfsSource?: WFSDataSourceOptions;
}
