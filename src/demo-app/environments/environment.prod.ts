import { SearchSourcesOptions, LanguageOptions } from '../../lib';

interface Environment {
  production: boolean;
  igo: {
    searchSources?: SearchSourcesOptions;
    language?: LanguageOptions;
  };
};

export const environment: Environment = {
  production: true,
  igo: {
    searchSources: {
      icherche: {
        enabled: false
      }
    },
    language: {
      prefix: './assets/locale/'
    }
  }
};
