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
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi'
        }
      ]
    },
    searchSources: {
      nominatim: {
        enabled: true
      },
      reseautq: {
        searchUrl: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
        locateUrl: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
        limit: 5,
        locateLimit: 15,
        zoomMaxOnSelect: 8,
        enabled: false,
        allowedPropertiesAlias:
        [
          {name: 'title', alias: 'Titre'},
          {name: 'etiquette', alias: 'Informations'},
          {name: 'nommun', alias: 'Municipalité'},
          {name: 'messagpan', alias: 'Message'},
          {name: 'noroute', alias: '# de route'},
          {name: 'nosortie', alias: '# de sortie'},
          {name: 'direction', alias: 'Direction'},
          {name: 'typesort', alias: 'Type de sortie'}
        ],
        distance : 0.5
      },
      icherche: {
        searchUrl: 'https://geoegl.msp.gouv.qc.ca/icherche/geocode',
        locateUrl: 'https://geoegl.msp.gouv.qc.ca/icherche/xy',
        zoomMaxOnSelect: 10,
        enabled: true
      },
      datasource: {
        searchUrl: 'https://geoegl.msp.gouv.qc.ca/igo2/api/layers/search',
        enabled: false
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
