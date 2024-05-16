import { Provider } from '@angular/core';

export interface SearchSourceOptions {
  title?: string;
  searchUrl?: string;
  available?: boolean;
  enabled?: boolean;
  order?: number;
  distance?: number;
  params?: ISearchSourceParams;
  settings?: SearchSourceSettings[];
  showInPointerSummary?: boolean;
  showInSettings?: boolean;
  showAdvancedSettings?: boolean;
}

export interface SearchSourceSettings {
  type: 'radiobutton' | 'checkbox';
  values: SettingOptions[];
  title: string;
  name: string;
  allEnabled?: boolean;
}

export interface ISearchSourceParams {
  limit?: string;
  datasets?: string;
  ecmax?: string;
  page?: string;
  type?: string;
}

export interface SettingOptions {
  value: string | number;
  enabled: boolean;
  title: string;
  hashtags?: string[];
  available?: boolean;
}

export interface TextSearchOptions {
  params?: { [key: string]: string };
  searchType?: 'Feature' | 'Layer'; // refer to search.enum.ts SEARCH_TYPES = [FEATURE, LAYER];
  getEnabledOnly?: boolean;
  extent?: [number, number, number, number];
  page?: number;
  sourceId?: string;
  forceNA?: boolean;
}

export interface ReverseSearchOptions {
  distance?: number;
  conf?: number;
  zoom?: number;
  params?: { [key: string]: string };
}

export interface SearchSourceFeature<KindT extends SearchSourceKind> {
  kind: KindT;
  providers: Provider[];
}

export enum SearchSourceKind {
  ICherche = 0,
  IChercheReverse = 1,
  Cadastre = 2,
  CoordinatesReverse = 3,
  ILayer = 4,
  Nominatim = 5,
  StoredQueries = 6,
  StoredQueriesReverse = 7,
  Workspace = 8
}
