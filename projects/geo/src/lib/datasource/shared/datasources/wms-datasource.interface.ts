import olSourceImageWMS from 'ol/source/ImageWMS';

import { DataSourceOptions } from './datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';

export interface WMSDataSourceOptions extends DataSourceOptions {
  optionsFromCapabilities?: boolean;
  wfsSource?: WFSDataSourceOptions;

  url: string;
  params: { [k: string]: any };
  projection?: string;
  version?: string;
  resolutions?: number[];
  serverType?: string;
  ratio?: number;
  ol?: olSourceImageWMS;
}
