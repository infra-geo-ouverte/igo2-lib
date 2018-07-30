import * as ol from 'openlayers';
import { DataSourceOptions } from './datasource.interface';

export interface WFSDataSourceOptions
  extends DataSourceOptions,
    ol.olx.source.VectorOptions {
  // version?: string;
  // url: string;
  // featureTypes: string;
  // fieldNameGeometry: string;
  // maxFeatures?: Number;
  // outputFormat?: string;
  // outputFormatDownload?: string;
  // srsname?: string;
}
