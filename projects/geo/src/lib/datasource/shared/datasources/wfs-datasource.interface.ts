import { DataSourceOptions } from './datasource.interface';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface WFSDataSourceOptions
  extends DataSourceOptions,
    FeatureDataSourceOptions {
  // type?: 'wfs';
  params: WFSDataSourceOptionsParams; // Used by user
  paramsWFS?: WFSDataSourceOptionsParams; // Used by code
  urlWfs?: string; // Used by code
}

export interface WFSDataSourceOptionsParams {
  version?: string;
  featureTypes: string;
  fieldNameGeometry: string;
  maxFeatures?: Number;
  outputFormat: string;
  outputFormatDownload?: string;
  srsname?: string;
  xmlFilter?: string;
  wfsCapabilities?: WFSCapabilitiesParams;
}

export interface WFSCapabilitiesParams {
  xmlBody?: string;
  GetPropertyValue?: boolean;
}
