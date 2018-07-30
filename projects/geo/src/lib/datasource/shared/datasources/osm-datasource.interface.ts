import * as ol from 'openlayers';
import { DataSourceOptions } from './datasource.interface';

export interface OSMDataSourceOptions
  extends DataSourceOptions,
    ol.olx.source.OSMOptions {}
