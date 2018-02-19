import { DataSourceOptions, DataSourceContext } from './datasource.interface';

export interface WFSDataSourceOptions extends DataSourceOptions, olx.source.VectorOptions {
    fieldNameGeometry: string;
    outputFormat?: string;
    version?: string;
  }
  
  export interface WFSDataSourceContext extends DataSourceContext, WFSDataSourceOptions {}
  