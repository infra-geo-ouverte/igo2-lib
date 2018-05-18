// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { IgoEnvironment } from '../../lib';

interface Environment {
  production: boolean;
  igo: IgoEnvironment;
}

export const environment: Environment = {
  production: false,
  igo: {
    searchSources: {
      icherche: {
        enabled: true,
        locateUrl: '/icherche/xy'
      },
      datasource: {
        enabled: false
      }
    },
    language: {
      prefix: './assets/locale/'
    },
    auth: {
      url: 'http://localhost:8000/users',
      tokenKey: 'igo_token',
      google: {
        apiKey: 'AIzaSyCbc-E35ZNqAjPvpbr30bAXwfcQoq5XLBs',
        clientId:
          '467961599657-f7lebhfn3oposibnrvlgjl7ffglgr2go.apps.googleusercontent.com'
      }
    }
  }
};
