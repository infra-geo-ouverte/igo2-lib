import { SearchSourceOptions } from './source.interfaces';

export interface ILayerSearchSourceOptions extends SearchSourceOptions {
  queryFormat?: {[key: string]: string | {urls: string[]}};
}

export interface ILayerData {
  id: string;
  source: ILayerDataSource;
  highlight: ILayerDataHighlight;
}

export interface ILayerDataSource {
  title: string;
  groupTitle: string;
  abstract: string;
  format: 'wms' | 'wfs';
  url: string;
  type: string;
  name: string;
}

export interface ILayerDataHighlight {
  title: string;
}

export interface ILayerResponse {
  items: ILayerData[];
}
