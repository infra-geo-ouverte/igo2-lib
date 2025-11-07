import { FeatureGeometry } from '../../../feature/shared/feature.interfaces';
import { SearchSourceOptions } from './source.interfaces';

export interface StoredQueriesSearchSourceOptions extends SearchSourceOptions {
  storedquery_id: string;
  fields: StoredQueriesFields[];
  srsname?: string;
  outputformat?: string;
  resultTitle?: string;
}

export interface StoredQueriesFields {
  name: string;
  defaultValue: any;
  splitPrefix?: string;
}

export interface StoredQueriesData {
  id: string;
  geometry: FeatureGeometry;
  properties: Record<string, any>;
}

export interface StoredQueriesResponse {
  features: StoredQueriesData[];
}

export interface StoredQueriesReverseSearchSourceOptions
  extends SearchSourceOptions {
  storedquery_id: string;
  longField: string;
  latField: string;
  srsname?: string;
  outputformat?: string;
  resultTitle?: string;
}

export interface StoredQueriesReverseData {
  id: string;
  geometry: FeatureGeometry;
  properties: Record<string, any>;
}

export interface StoredQueriesReverseResponse {
  features: StoredQueriesData[];
}
