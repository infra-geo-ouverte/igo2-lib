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
import { DOMOptions } from '@igo2/common';
import { BaseEnvironmentOptions, CoreOptions } from '@igo2/core';

export interface EnvironmentOptions extends BaseEnvironmentOptions {
  igo: IgoOptions;
}

export interface IgoOptions extends CoreOptions {
  app?: AppOptions;
  auth?: AuthOptions;
  catalog?: CatalogServiceOptions;
  context?: ContextServiceOptions;
  depot?: { url: string; trainingGuides?: string[] };
  dom?: DOMOptions[];
  importExport?: ImportExportServiceOptions;
  importWithStyle?: boolean;
  interactiveTour?: InteractiveTourConfigOptions;
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
  searchSources?: { [key: string]: SearchSourceOptions | StoredQueriesSearchSourceOptions | StoredQueriesReverseSearchSourceOptions };
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
