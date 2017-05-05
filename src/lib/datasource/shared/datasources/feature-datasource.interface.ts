import { DataSourceOptions } from './datasource.interface';

export interface FeatureDataSourceOptions extends DataSourceOptions, olx.source.VectorOptions {
  formatType?: string;
  formatOptions?: any;
}
