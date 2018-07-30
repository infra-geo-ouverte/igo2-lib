import { DataSource } from './datasource';

export interface DataSourceOptions {
  type?: string;
  legend?: DataSourceLegendOptions;
  // title: string;
  // alias?: string;

  // view?: ol.olx.layer.ImageOptions;
  // displayField?: string;
  ol?: any;
}

export interface DataSourceLegendOptions {
  collapsed?: boolean;
  display?: boolean;
  url?: string;
  html?: string;
  style?: { [key: string]: string | number };
  title?: string;
}
