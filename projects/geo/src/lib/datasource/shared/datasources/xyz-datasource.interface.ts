import * as ol from 'openlayers';
import { DataSourceOptions } from './datasource.interface';

export interface XYZDataSourceOptions
  extends DataSourceOptions,
    ol.olx.source.XYZOptions {}
