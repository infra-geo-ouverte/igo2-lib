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
    projections: [
      {
        code: 'EPSG:32198',
        def: '+proj=lcc +lat_1=60 +lat_2=46 +lat_0=44 +lon_0=-68.5 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
        extent: [-886251.0296, 180252.9126, 897177.3418, 2106143.8139]
      }
    ],
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
          id: 'Gououvert',
          title: 'Gouvouvert',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi'
        },
        {
          id: 'DefiningInfoFormat',
          title: 'Defining info_format',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
          queryFormat: {
            html: '*',
            'application/json':  ['stations_meteoroutieres', 'histo_stations_meteoroutieres']
          },
          queryHtmlTarget: 'iframe',
          count: 30
        },
        {
          id: 'catalogwithregex',
          title: 'Filtered catalog by regex',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
          regFilters: ['zpegt']

        },
        {
          id: 'catalogwithtooltipcontrol',
          title: 'Controling tooltip format',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
          tooltipType: 'abstract' // or title
        }
      ]
    },
    searchSources: {
      nominatim: {
        enabled: false
      },
      reseautq: {
        searchUrl: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
        locateUrl: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
        limit: 5,
        locateLimit: 15,
        zoomMaxOnSelect: 8,
        enabled: false,
        propertiesAlias:
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
        searchUrl: '/icherche/geocode',
        zoomMaxOnSelect: 10,
        enabled: true
      },
      icherchereverse: {
        searchUrl: '/icherche/xy',
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
