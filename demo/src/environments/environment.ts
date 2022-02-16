// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---configuration production` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// import { IgoEnvironment } from '@igo2/core';

interface Environment {
  production: boolean;
  igo: any;
}

export const environment: Environment = {
  production: false,
  igo: {
    importWithStyle: true,
    projections: [
      {
        code: 'EPSG:32198',
        alias: 'Quebec Lambert',
        def:
          '+proj=lcc +lat_1=60 +lat_2=46 +lat_0=44 +lon_0=-68.5 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
        extent: [-886251.0296, 180252.9126, 897177.3418, 2106143.8139]
      }
    ],
    auth: {
      url: '/apis/users',
      tokenKey: 'testIgo2Lib',
      intern: {
        enabled: true
      },
      allowAnonymous: true
    },
    language: {
      prefix: './locale/'
    },
    interactiveTour: {
      tourInMobile: true,
      activateInteractiveTour: true
    },
    importExport: {
      url: '/apis/ogre',
      gpxAggregateInComment: true
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
            'application/json': [
              'stations_meteoroutieres',
              'histo_stations_meteoroutieres'
            ]
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
        },
        {
          id: 'arcgisrestcompletecatalog',
          title: 'ArcGIS Rest complete catalog',
          url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/CSAS_Corals_Sponges_2010_FR/MapServer',
          type: 'arcgisrest'
        },
        {
          id: 'arcgisrestcatalog',
          title: 'ArcGIS Rest Focus catalog',
          url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/CSAS_Corals_Sponges_2010_FR/MapServer',
          type: 'arcgisrest',
          regFilters: ['^10$'],
          forcedProperties: [{
            layerName: 'Les lits d|éponges dans la zone biogéographique du golfe - l|engin de chalutage Campelen',
            title: 'Nouveau nom pour cette couche ArcGIS REST focus',
            catalogAbstract: "On a délimité les concentrations de plumes de mer, de petites et grandes gorgones, et d\'éponges sur la côte est du Canada par le biais de l\'analyse spatiale des données sur lesprises accessoires recueillies lors des relevés effectués par navire de recherche. L\'analyse aadopté une approche de l'Organisation des pêches de l'Atlantique Nord-Ouest (OPANO) dansla zone de réglementation du Bonnet Flamand et le sud-est des Grands Bancs. On a eu recoursà une analyse du noyau de densité afin de délimiter les hautes concentrations. De tellesanalyses ont été réalisées pour chacune des cinq zones biogéographiques de l'est du Canada.Les plus grandes colonies de plumes de mer ont été découvertes dans le chenal Laurentien quicoupe le golfe du Saint-Laurent, alors que les grands regroupements de gorgones ont ététrouvés dans l'Arctique de l'Est et le nord de la pente continentale du Labrador. De grosseséponges en boule de plusieurs espèces de Geodia se trouvaient le long des pentescontinentales au nord des Grands Bancs, tandis qu'on a identifié sur le Plateau néo-écossaisune seule population de grosses éponges en forme de tonneau de l'espèce Vazella pourtalesi.On fournit la latitude et la longitude marquant les positions de tous les traits qui forment cescolonies et d'autres concentrations denses, ainsi que les positions de tous les traits de chalutqui ont permis de remonter à la surface du corail noir, un taxon que l'on ne retrouve pas enregroupement, qui est d’une grande longévité et vulnérable à la pression de la pêche.",
            description: 'Nouvelle description'
          }]
        },
        {
          id: 'fusion_catalog',
          title: '(composite catalog) fusion catalog',
          composite: [
            {
              id: 'tq_swtq',
              url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq'
            },
            {
              id: 'rn_wmts',
              url:
                'https://servicesmatriciels.mern.gouv.qc.ca/erdas-iws/ogc/wmts/Cartes_Images',
              type: 'wmts',
              crossOrigin: true,
              matrixSet: 'EPSG_3857',
              version: '1.0.0'
            }
          ]
        },
        {
          id: 'group_impose',
          title:
            '(composite catalog) group imposed and unique layer title for same source',
          composite: [
            {
              id: 'tq_swtq',
              url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
              regFilters: ['zpegt'],
              groupImpose: { id: 'zpegt', title: 'zpegt' }
            },
            {
              id: 'Gououvert',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
              regFilters: ['zpegt'],
              groupImpose: { id: 'zpegt', title: 'zpegt' }
            },
            {
              id: 'Gououvert',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
              regFilters: ['zpegt'],
              groupImpose: { id: 'zpegt', title: 'zpegt' }
            },
            {
              id: 'rn_wmts',
              url:
                'https://servicesmatriciels.mern.gouv.qc.ca/erdas-iws/ogc/wmts/Cartes_Images',
              type: 'wmts',
              crossOrigin: true,
              matrixSet: 'EPSG_3857',
              version: '1.0.0',
              groupImpose: {
                id: 'cartetopo',
                title: 'Carte topo échelle 1/20 000'
              }
            }
          ]
        },
        {
          id: 'tag_layernametitle',
          title: '(composite catalog) tag source on same layer title',
          composite: [
            {
              id: 'tq_swtq',
              url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
              regFilters: ['limtn_charg'],
              groupImpose: { id: 'mix_swtq_gouv', title: 'mix same name layer' }
            },
            {
              id: 'Gououvert',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
              regFilters: ['limtn_charg'],
              groupImpose: { id: 'mix_swtq_gouv', title: 'mix same name layer' }
            }
          ]
        }
      ]
    },
    searchSources: {
      storedqueries: {
        available: true,
        title: 'Feuillets SNRC',
        searchUrl: '/ws/mffpecofor.fcgi',
        storedquery_id: 'sq250et20kFeuillet',
        fields: { name: 'no_feuillet', defaultValue: '0'},
        resultTitle: 'feuillet',
        params: {
          limit: '8'
        }
    },
      nominatim: {
        enabled: false
      },
      icherche: {
        searchUrl: '/apis/icherche',
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
        searchUrl: '/apis/terrapi',
        order: 3,
        enabled: true
      },
      ilayer: {
        searchUrl: '/apis/icherche/layers',
        order: 4,
        enabled: true,
        params: {
          limit: '5'
        }
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
