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

export interface StoredQueriesReverseSearchSourceOptions extends SearchSourceOptions {
  storedquery_id: string;
  longField: string;
  latField: string;
  srsname?: string;
  outputformat?: string;
}

export interface StoredQueriesReverseData {
  id: string;
  // doc_type: string;
  // recherche: string;
  // highlight: string;
  geometry: FeatureGeometry;
  // bbox: [number, number, number, number];
  properties: { [key: string]: any };
}

export interface StoredQueriesReverseResponse {
  features: StoredQueriesData[];
}
