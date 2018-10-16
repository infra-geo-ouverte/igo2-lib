import olSourceImageWMS from 'ol/source/ImageWMS';

import { DataSourceOptions } from './datasource.interface';
import { WFSDataSourceOptionsParams } from './wfs-datasource.interface';

export interface WMSDataSourceOptions extends DataSourceOptions {
  // type?: 'wms';
  optionsFromCapabilities?: boolean;
  paramsWFS?: WFSDataSourceOptionsParams; // for wms linked with wfs
  urlWfs?: string; // if url for linked wfs differ from the url for wms.
  url: string;
  params: WMSDataSourceOptionsParams;
  projection?: string;
  resolutions?: number[];
  serverType?: string;
  ratio?: number;
  ol?: olSourceImageWMS;
  refreshIntervalSec?: number;
}

export interface WMSDataSourceOptionsParams {
  layers: string;
  version?: string;
  time?: string;
}
