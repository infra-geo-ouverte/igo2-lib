import { DataSourceOptions, DataSourceContext } from './datasource.interface';

export interface FeatureDataSourceOptions extends DataSourceOptions, olx.source.VectorOptions {
  formatType?: string;
  formatOptions?: any;
}

export interface FeatureDataSourceContext extends DataSourceContext, FeatureDataSourceOptions {}
