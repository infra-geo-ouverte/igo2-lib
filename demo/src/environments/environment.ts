// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// import { IgoEnvironment } from '@igo2/core';

interface Environment {
  production: boolean;
  igo: any;
}

export const environment: Environment = {
  production: false,
  igo: {
    auth: {
      intern: {
        enabled: true
      }
    },
    language: {
      prefix: './locale/'
    },
    catalog: {
      sources: [
        {
          title: 'Gouvouvert',
          url: 'https://geoegl.msp.gouv.qc.ca/igo2/api/ws/igo_gouvouvert.fcgi'
        }
      ]
    },
    searchSources: {
      nominatim: {
        enabled: false
      },
      icherche: {
        url: 'https://geoegl.msp.gouv.qc.ca/icherche/geocode'
      },
      datasource: {
        url: 'https://geoegl.msp.gouv.qc.ca/igo2/api/layers/search'
      }
    }
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
