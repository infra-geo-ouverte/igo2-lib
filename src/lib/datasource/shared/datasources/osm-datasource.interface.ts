import { DataSourceOptions, DataSourceContext } from './datasource.interface';

export interface OSMDataSourceOptions extends DataSourceOptions, olx.source.OSMOptions {}

export interface OSMDataSourceContext extends DataSourceContext {}
