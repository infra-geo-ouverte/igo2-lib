import { DataSourceOptions, DataSourceContext } from './datasource.interface';

export interface OSMDataSourceOptions extends DataSourceOptions, ol.olx.source.OSMOptions {}

export interface OSMDataSourceContext extends DataSourceContext {}
