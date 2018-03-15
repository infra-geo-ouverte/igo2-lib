import { SearchSourcesOptions, LanguageOptions, AuthOptions,
  ContextServiceOptions, CatalogServiceOptions, ImportExportServiceOptions
} from './';

export interface IgoEnvironment {
  searchSources?: SearchSourcesOptions;
  language?: LanguageOptions;
  auth?: AuthOptions;
  context?: ContextServiceOptions;
  catalog?: CatalogServiceOptions;
  importExport?: ImportExportServiceOptions;
}
