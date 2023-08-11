import { EnvironmentOptions } from '@igo2/integration';
import { TooltipType } from '@igo2/geo';

export const environment: EnvironmentOptions = {
  production: true,
  igo: {
    projections: [
      {
        code: 'EPSG:32198',
        alias: 'Quebec Lambert',
        def: '+proj=lcc +lat_1=60 +lat_2=46 +lat_0=44 +lon_0=-68.5 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
        extent: [-886251.0296, 180252.9126, 897177.3418, 2106143.8139]
      }
    ],
    auth: {
      tokenKey: 'testIgo2Lib',
      intern: {
        enabled: true
      },
      allowAnonymous: true
    },
    interactiveTour: {
      tourInMobile: true,
      activateInteractiveTour: true
    },
    importExport: {
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ogre'
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
          // TODO pelord, serais-tu en mesure de corriger l'interface?
          // queryFormat: {
          //   html: '*',
          //   'application/json': [
          //     'stations_meteoroutieres',
          //     'histo_stations_meteoroutieres'
          //   ]
          // },
          // queryHtmlTarget: 'iframe',
          // count: 30
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
          tooltipType: TooltipType.ABSTRACT
        }
      ]
    },
    monitoring: {
      provider: 'sentry',
      dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      identifyUser: true,
    },
    searchSources: {
      storedqueriesreverse: { enabled: false },
      nominatim: {
        enabled: false
      },
      icherche: {
        searchUrl: 'https://geoegl.msp.gouv.qc.ca/apis/icherche',
        order: 2,
        enabled: true,
        params: {
          limit: '8'
        }
      },
      coordinatesreverse: {
        showInPointerSummary: true
      },
      icherchereverse: {
        showInPointerSummary: true,
        searchUrl: 'https://geoegl.msp.gouv.qc.ca/apis/terrapi',
        order: 3,
        enabled: true
      },
      ilayer: {
        searchUrl: 'https://geoegl.msp.gouv.qc.ca/apis/layers/search',
        order: 4,
        enabled: true,
        params: {
          limit: '5'
        }
      }
    }
  }
};
