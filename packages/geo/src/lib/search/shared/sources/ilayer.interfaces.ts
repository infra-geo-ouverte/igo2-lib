import { WMSDataSourceOptions } from '../../../datasource/shared/datasources/wms-datasource.interface';
import { ImageLayerOptions } from '../../../layer/shared/layers/image-layer.interface';
import { QueryableDataSourceOptions } from './../../../query/shared/query.interfaces';
import { SearchSourceOptions } from './source.interfaces';

export interface ILayerSearchSourceOptions extends SearchSourceOptions {
  queryFormat?: Record<string, string | { urls: string[] }>;
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
  metadataUrl?: string;
  maxScaleDenom?: string;
  minScaleDenom?: string;
}

export interface ILayerDataHighlight {
  title?: string;
  groupTitle?: string;
}

interface QueryWMSDataSourceOptions
  extends WMSDataSourceOptions,
    QueryableDataSourceOptions {}

export interface ILayerItemResponse extends ImageLayerOptions {
  title: string;
  sourceOptions: QueryWMSDataSourceOptions;
  properties: Record<string, any>;
}
