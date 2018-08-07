import { DataSourceOptions } from './datasource.interface';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface WFSDataSourceOptions
  extends DataSourceOptions,
    FeatureDataSourceOptions {
  // type?: 'wfs';
  params: WFSDataSourceOptionsParams;
}

export interface WFSDataSourceOptionsParams {
  version?: string;
  featureTypes: string;
  fieldNameGeometry: string;
  maxFeatures?: Number;
  outputFormat?: string;
  srsname?: string;
  xmlFilter?: string;
}
