import olSourceImageWMS from 'ol/source/ImageWMS';

import { DataSourceOptions } from './datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';

export interface WMSDataSourceOptions extends DataSourceOptions {
  // type?: 'wms';
  optionsFromCapabilities?: boolean;
  wfsSource?: WFSDataSourceOptions;

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
