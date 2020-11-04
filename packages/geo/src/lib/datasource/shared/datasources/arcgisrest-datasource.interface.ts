import olAttribution from 'ol/control/Attribution';

import { DataSourceOptions } from './datasource.interface';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface ArcGISRestDataSourceOptions extends FeatureDataSourceOptions {
  // type?: 'arcgisrest'
  layer: string;
  params?: ArcGISRestDataSourceOptionsParams;
  idColumn?: string;
}

export interface ArcGISRestDataSourceOptionsParams {
  customParams?: string[]; // any ArcGIS Rest query parameters for feature service layer resource
  legendInfo?: any;
  style?: any;
  timefilter?: any;
  timeExtent?: string;
  attributions?: olAttribution;
}
