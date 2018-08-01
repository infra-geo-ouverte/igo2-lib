import { DataSourceOptions } from './datasource.interface';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface WFSDataSourceOptions
  extends DataSourceOptions,
    FeatureDataSourceOptions {
  // version?: string;
  // url: string;
  // featureTypes: string;
  // fieldNameGeometry: string;
  // maxFeatures?: Number;
  // outputFormat?: string;
  // outputFormatDownload?: string;
  // srsname?: string;
}
