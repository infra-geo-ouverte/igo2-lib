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
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
          forcedProperties: [{
            newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/"
          }]
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
          count: 30,
          forcedProperties: [{
            newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/"
          }]
        },
        {
          id: 'catalogwithregex',
          title: 'Filtered catalog by regex',
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
          regFilters: ['zpegt'],
          forcedProperties: [{
            newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/"
          }]
        },
        {
          id: 'catalogwithtooltipcontrol',
          title: 'Controling tooltip format',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
          tooltipType: 'abstract', // or title
          forcedProperties: [{
            newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/"
          }]
        },
        {
          id: 'arcgisrestcompletecatalog',
          title: 'ArcGIS Rest complete catalog',
          url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/CSAS_Corals_Sponges_2010_FR/MapServer',
          type: 'arcgisrest',
          forcedProperties: [{
            newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/"
          }]
        },
        {
          id: 'arcgisrestcatalog',
          title: 'ArcGIS Rest Focus catalog',
          url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/CSAS_Corals_Sponges_2010_FR/MapServer',
          type: 'arcgisrest',
          regFilters: ['^10$'],
          forcedProperties: [{
            layerName: 'Les lits d|éponges dans la zone biogéographique du golfe - l|engin de chalutage Campelen',
            title: "----Nouveau nom pour cette couche ArcGIS REST focus",
            newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/",
            newMetadataAbstract: "Ceci est un nouveau abstract"
          }]
        },
        {
          id: 'arcgisrestcatalogmaritime',
          title: 'ArcGIS Rest Focus Maritime catalog',
          url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/CHS/ENC_MaritimeChartService/MapServer/exts/MaritimeChartService/MapServer',
          type: 'arcgisrest',
          forcedProperties: [
            {
              layerName: "Information about the chart display",
              title: "New ESRI layer name",
              newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/",
              //newMetadataAbstract: "New ESRI abstract",
            },
            {
              layerName: "Natural and man-made features, port features",
              title: "New 2nd ESRI layer name",
              newMetadataUrl: "https://gitlab.com/",
              //newMetadataAbstract: "New 2nd ESRI abstract",
            },
            {
              layerName: "All",
              //newMetadataUrlAll: "https://github.com/infra-geo-ouverte/igo2-lib/", // when we set this property it applies to all layers
              newMetadataAbstractAll: "New abstract to all other layers"
            }
          ]
        },
        {
          id: 'fusion_catalog',
          title: '(composite catalog) fusion catalog',
          composite: [
            {
              id: 'tq_swtq',
              url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
              forcedProperties: [{
              newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/",
              }]
            },
            {
            id: 'arcgisrestcompletecatalog',
            title: 'ArcGIS Rest complete catalog',
            url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/CSAS_Corals_Sponges_2010_FR/MapServer',
            type: 'arcgisrest',
            regFilters: ["^0$"]
            },
            { // dead ESRI link
              id: "38",
              externalProvider: true,
              url: "https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/Canadas_Marine_Conservation_Targets_FR/MapServer",
              type: "imagearcgisrest",
              groupImpose: {"id": "conserve", "title": "Conservation"},
              regFilters: ["^0$"]
            },
            {// wmts regFilters error link
              id: 'wmts_error',
              url:
                'https://servicesmatriciels.mern.gouv.qc.ca/erdas-iws/ogc/wmts/Elevation?SERVICE=WMTS&REQUEST=GetCapabilities',
              type: 'wmts',
              crossOrigin: true,
              matrixSet: 'EPSG_3857',
              version: '1.0.0',
              forcedProperties: [
                {
                  layerName: "BDTQ-20K_Allegee",
                  title: "New WMTS layer name",
                  newMetadataAbstract: "Nouvel Abstract WMTS",
                  //newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/"
                },
                {
                  layerName: "BDTQ-20K",
                  title: "New 2nd WMTS layer name",
                  //newMetadataAbstract: "New WMTS Abstract",
                  newMetadataUrl: "https://gitlab.com/"
                },
                {
                  layerName: "All",
                  newMetadataAbstractAll: "New WMTS Abstract to all other layers",
                  //newMetadataUrlAll: "https://quebec.ca/" // overrides newMetadataUrl
                }
            ]
            },
            {
              id: 'wms',
              url: 'https://cartes.geogratis.gc.ca/wms/canvec_fr',
              type: 'wms',
              crossOrigin: true,
              version: '1.3.0',
              forcedProperties: [
                {
                  layerName: "atlas_named_feature_polygon_large",
                  title: "New WMS name",
                  newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/",
                  newMetadataAbstract: "New WMS Abstract"
                },
                {
                  layerName: "woodedarea_50k",
                  title: "New 2nd WMS name",
                  //newMetadataUrl: "https://gitlab.com/",
                  newMetadataAbstract: "New 2nd WMS abstract"
                },
                {
                  layerName: "All",
                  //newMetadataUrlAll: "https://quebec.ca/",
                  //newMetadataAbstractAll: "New WMS abstract to all other layers"
                }
              ]
              //regFilters: ["^100$"]
            },
            {// wms CORS error link
              id: 'wms_cors_error',
              url: 'https://daata.chs-shc.ca/geoserver/wms',
              type: "wms",
              version: "1.3.0"
            },
            {// wms working link
              id: 'wms_cors_error',
              url: 'https://cartes.geogratis.gc.ca/wms/canvec_fr',
              type: "wms",
              version: "1.3.0",
              regFilters: ["hydro_obstacle_polygon_50k"]
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
              groupImpose: { id: 'zpegt', title: 'zpegt' },
              forcedProperties: [{
                newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/"
              }]
            },
            {
              id: 'wms',
              url: 'https://cartes.geogratis.gc.ca/wms/canvec_fr',
              type: 'wms',
              crossOrigin: true,
              version: '1.3.0',
              forcedProperties: [{
                newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/",
                newMetadataAbstract: "Nouveau Abstract WMS"
              }]
            },
            {
              id: 'Gououvert',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
              regFilters: ['zpegt'],
              groupImpose: { id: 'zpegt', title: 'zpegt' },
              forcedProperties: [{
                newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/"
              }]
            },
            {
              id: 'rn_wmts_1',
              url:
                'https://servicesmatriciels.mern.gouv.qc.ca/erdas-iws/ogc/wmts/Cartes_Images',
              type: 'wmts',
              crossOrigin: true,
              matrixSet: 'EPSG_3857',
              version: '1.0.0',
              groupImpose: {
                id: 'cartetopo',
                title: 'Carte topo échelle 1/20 000'
              },
              forcedProperties: [{
                //newMetadataAbstract: "New WMTS Abstract"
              }]
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
              groupImpose: { id: 'mix_swtq_gouv', title: 'mix same name layer' },
              forcedProperties: [{
                newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/"
              }]
            },
            {
              id: 'Gououvert',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
              regFilters: ['limtn_charg'],
              groupImpose: { id: 'mix_swtq_gouv', title: 'mix same name layer' },
              forcedProperties: [{
                newMetadataUrl: "https://gitlab.forge.gouv.qc.ca/"
              }]
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
