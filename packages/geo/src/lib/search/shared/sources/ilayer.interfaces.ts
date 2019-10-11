import { QueryableDataSourceOptions } from './../../../query/shared/query.interfaces';
import { WMSDataSourceOptions } from '../../../datasource/shared/datasources/wms-datasource.interface';
import { SearchSourceOptions } from './source.interfaces';

export interface ILayerSearchSourceOptions extends SearchSourceOptions {
  queryFormat?: {[key: string]: string | {urls: string[]}};
}

export interface ILayerServiceResponse {
  items: ILayerData[];
}

export interface ILayerData {
  score: number;
  properties: ILayerDataSource;
  highlight: ILayerDataHighlight;
}

export interface ILayerDataSource {
  id?: string;
  title: string;
  groupTitle: string;
  abstract: string;
  format?: 'wms' | 'wfs';
  url?: string;
  type?: string;
  name?: string;
  queryable?: boolean;
}

export interface ILayerDataHighlight {
  title?: string;
  groupTitle?: string;
}

interface QueryWMSDataSourceOptions
      extends WMSDataSourceOptions,
        QueryableDataSourceOptions {}

export interface ILayerItemResponse {
  title: string;
  sourceOptions: QueryWMSDataSourceOptions;
  properties: { [key: string]: any };
}
