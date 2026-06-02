import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface ArcGISRestDataSourceOptions extends FeatureDataSourceOptions {
  // type?: 'arcgisrest'
  layer: string;
  legendInfo?: any;
  params?: ArcGISRestDataSourceOptionsParams;
  idColumn?: string;
}

export interface ArcGISRestDataSourceOptionsParams {
  customParams?: string[]; // any ArcGIS Rest query parameters for feature service layer resource
  style?: any;
  timefilter?: any;
  timeExtent?: string;
  time?: string;
  attributions?: string | string[];
}

export interface ArcGISSymbol {
  type?: string;
  style?: string;
  color?: number[];
  width?: number;
  outline?: { color: number[]; width: number };
  size?: number;
  contentType?: string;
  imageData?: string;
}
