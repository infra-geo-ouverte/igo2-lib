import { SearchSourcesOptions, LanguageOptions, AuthOptions } from '../../lib';

interface Environment {
  production: boolean;
  igo: {
    searchSources?: SearchSourcesOptions;
    language?: LanguageOptions;
    auth?: AuthOptions;
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
    },
    auth: {
      url: 'http://localhost:8000/users',
      tokenKey: 'id_token_igo',
      google: {
        apiKey: 'AIzaSyCbc-E35ZNqAjPvpbr30bAXwfcQoq5XLBs',
        clientId: '467961599657-f7lebhfn3oposibnrvlgjl7ffglgr2go.apps.googleusercontent.com'
      },
      facebook: {
        apiKey: '1989457734616371',
        enabled: false
      }
    }
  }
};
