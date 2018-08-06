import { DataSourceOptions } from './datasource.interface';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface WFSDataSourceOptions
  extends DataSourceOptions,
    FeatureDataSourceOptions {
  params: WFSDataSourceOptionsParams;
}

export interface WFSDataSourceOptionsParams
  extends DataSourceOptions,
    FeatureDataSourceOptions {
  version?: string;
  featureTypes: string;
  fieldNameGeometry: string;
  maxFeatures?: Number;
  outputFormat?: string;
  srsname?: string;
}
