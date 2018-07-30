import * as ol from 'openlayers';
import { DataSourceOptions } from './datasource.interface';

export interface FeatureDataSourceOptions
  extends DataSourceOptions,
    ol.olx.source.VectorOptions {
  formatType?: string;
  formatOptions?: any;
}
