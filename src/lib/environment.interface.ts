import { SearchSourcesOptions, LanguageOptions, AuthOptions, AnalyticsOptions,
  ContextServiceOptions, CatalogServiceOptions, ImportExportServiceOptions,
  MessageOptions
} from './';

export interface IgoEnvironment {
  analytics?: AnalyticsOptions;
  searchSources?: SearchSourcesOptions;
  language?: LanguageOptions;
  auth?: AuthOptions;
  context?: ContextServiceOptions;
  catalog?: CatalogServiceOptions;
  importExport?: ImportExportServiceOptions;
  message?: MessageOptions;
}
