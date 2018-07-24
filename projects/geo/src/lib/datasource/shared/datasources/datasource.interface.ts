import * as ol from 'openlayers';

import { DataSource } from './datasource';

export interface DataSourceOptions {
  title: string;
  alias?: string;
  legend?: DataSourceLegendOptions;
  view?: ol.olx.layer.ImageOptions;
  displayField?: string;
}

export interface DataSourceContext extends DataSourceOptions {
  type: string;
}

export interface DataSourceLegendOptions {
  collapsed?: boolean;
  display?: boolean;
  url?: string;
  html?: string;
  style?: { [key: string]: string | number };
  title?: string;
}
