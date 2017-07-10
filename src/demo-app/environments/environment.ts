// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

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
  production: false,
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
