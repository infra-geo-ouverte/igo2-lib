import { AuthOptions, AuthStorageOptions } from '@igo2/auth';
import { ContextServiceOptions } from '@igo2/context';
import {
  CatalogServiceOptions,
  CommonVectorStyleOptions,
  ImportExportServiceOptions,
  Projection,
  SearchSourceOptions,
  StoredQueriesReverseSearchSourceOptions,
  StoredQueriesSearchSourceOptions
} from '@igo2/geo';
import { LanguageOptions } from '../language';
import { DOMOptions } from '@igo2/common';

export interface EnvironmentOptions {
  production: boolean;
  igo: IgoOptions;
}

export interface IgoOptions {
  app?: AppOptions;
  auth?: AuthOptions;
  catalog?: CatalogServiceOptions;
  context?: ContextServiceOptions;
  depot?: { url: string; trainingGuides?: string[] };
  dom?: DOMOptions[];
  importExport?: ImportExportServiceOptions;
  importWithStyle?: boolean;
  interactiveTour?: InteractiveTourConfigOptions;
  language?: LanguageOptions;
  projections?: Projection[];
  queryOverlayStyle?: {
    base?: CommonVectorStyleOptions;
    selection?: CommonVectorStyleOptions;
    focus?: CommonVectorStyleOptions;
  };
  searchOverlayStyle?: {
    base?: CommonVectorStyleOptions;
    selection?: CommonVectorStyleOptions;
    focus?: CommonVectorStyleOptions;
  };
  searchSources?: {
    [key: string]:
      | SearchSourceOptions
      | StoredQueriesSearchSourceOptions
      | StoredQueriesReverseSearchSourceOptions;
  };
  storage?: AuthStorageOptions;
}

export interface AppOptions {
  forceCoordsNA: boolean;
  install: {
    enabled?: boolean;
    promote?: boolean;
    manifestPath?: string;
  };
  pwa?: {
    enabled?: boolean;
    path?: string;
  };
}

export interface InteractiveTourConfigOptions {
  activateInteractiveTour: boolean;
  tourInMobile: boolean;
  pathToConfigFile?: string;
}
