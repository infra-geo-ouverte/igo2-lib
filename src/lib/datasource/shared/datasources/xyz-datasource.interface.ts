import { DataSourceOptions, DataSourceContext } from './datasource.interface';

export interface XYZDataSourceOptions extends DataSourceOptions, ol.olx.source.XYZOptions {}

export interface XYZDataSourceContext extends DataSourceContext {}
