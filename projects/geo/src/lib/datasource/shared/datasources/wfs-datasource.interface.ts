import * as ol from 'openlayers';
import {
  DataSourceOptions,
  DataSourceContext
  // OgcFilterableDataSourceOptions
} from './datasource.interface';

export interface WFSDataSourceOptions
  extends DataSourceOptions,
    ol.olx.source.VectorOptions {
  // OgcFilterableDataSourceOptions {
  version?: string;
  url: string;
  featureTypes: string;
  fieldNameGeometry: string;
  maxFeatures?: Number;
  outputFormat?: string;
  outputFormatDownload?: string;
  srsname?: string;
}

export interface WFSDataSourceContext
  extends DataSourceContext,
    WFSDataSourceOptions {}
