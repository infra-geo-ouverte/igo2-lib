import { FeatureGeometry } from '../../../feature';
import { SearchSourceOptions } from './source.interfaces';

export interface StoredQueriesSearchSourceOptions extends SearchSourceOptions {
  storedquery_id: string;
  fields: StoredQueriesFields[];
  srsname?: string;
  outputformat?: string;
}

export interface StoredQueriesFields {
  name: string;
  defaultValue: any;
  firstField: boolean;
  splitPrefix?: string;
}

export interface StoredQueriesData {
  id: string;
  // doc_type: string;
  // recherche: string;
  // highlight: string;
  geometry: FeatureGeometry;
  // bbox: [number, number, number, number];
  properties: { [key: string]: any };
}

export interface StoredQueriesResponse {
  features: StoredQueriesData[];
}

export interface StoredQueriesReverseData {
  _id: string;
  doc_type: string;
  recherche: string;
  highlight: string;
  geometry: FeatureGeometry;
  bbox: [number, number, number, number];
  properties: { [key: string]: any };
}

export interface StoredQueriesReverseResponse {
  features: StoredQueriesData[];
}
