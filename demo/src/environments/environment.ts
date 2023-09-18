import { EnvironmentOptions } from '@igo2/integration';
import { TooltipType } from '@igo2/geo';

export const environment: EnvironmentOptions = {
  production: false,
  igo: {
    importWithStyle: true,
    projections: [
      {
        code: 'EPSG:32198',
        alias: 'Quebec Lambert',
        def: '+proj=lcc +lat_1=60 +lat_2=46 +lat_0=44 +lon_0=-68.5 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
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
      gpxAggregateInComment: true,
      importWithStyle: true
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
          url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq'
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
          forcedProperties: [
            {
              layerName:
                'Les lits d|éponges dans la zone biogéographique du golfe - l|engin de chalutage Campelen',
              title: '----Nouveau nom pour cette couche ArcGIS REST focus'
            }
          ]
        },
        {
          id: 'arcgisrestcatalogmaritime',
          title: 'ArcGIS Rest Focus Maritime catalog',
          url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/CHS/ENC_MaritimeChartService/MapServer/exts/MaritimeChartService/MapServer',
          type: 'arcgisrest',
          forcedProperties: [
            {
              layerName: 'Information about the chart display',
              title: 'New ESRI layer name',
              metadataUrl: 'https://www.igouverte.org/demo/'
              //metadataAbstract: "New ESRI abstract",
            },
            {
              layerName: 'Natural and man-made features, port features',
              title: 'New 2nd ESRI layer name',
              //metadataUrl: "https://gitlab.com/",
              metadataAbstract: 'New 2nd ESRI abstract'
            },
            {
              layerName: '*',
              //metadataUrlAll: "https://github.com/infra-geo-ouverte/igo2-lib/", // when we set this property it applies to all layers
              metadataAbstractAll: 'New abstract to all layers'
            }
          ]
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
              id: 'arcgisrestcompletecatalog',
              title: 'ArcGIS Rest complete catalog',
              url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/CSAS_Corals_Sponges_2010_FR/MapServer',
              type: 'arcgisrest',
              regFilters: ['^0$']
            },
            {
              // dead ESRI link
              id: '38',
              externalProvider: true,
              url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/Canadas_Marine_Conservation_Targets_FR/MapServer',
              type: 'imagearcgisrest',
              groupImpose: { id: 'conserve', title: 'Conservation' },
              regFilters: ['^0$']
            },
            {
              // wmts regFilters error link
              id: 'wmts_error',
              url: 'https://servicesmatriciels.mern.gouv.qc.ca/erdas-iws/ogc/wmts/Elevation?SERVICE=WMTS&REQUEST=GetCapabilities',
              type: 'wmts',
              setCrossOriginAnonymous: true,
              matrixSet: 'EPSG_3857',
              version: '1.0.0',
              forcedProperties: [
                {
                  layerName: 'BDTQ-20K_Allegee',
                  title: 'New WMTS layer name'
                },
                {
                  layerName: 'BDTQ-20K',
                  title: 'New 2nd WMTS layer name'
                }
              ]
            },
            {
              id: 'wms',
              url: 'https://cartes.geogratis.gc.ca/wms/canvec_fr',
              type: 'wms',
              setCrossOriginAnonymous: true,
              version: '1.3.0',
              forcedProperties: [
                {
                  // le dernier de Entités toponymiques
                  layerName: 'atlas_named_feature_polygon_large',
                  title: 'New WMS name',
                  metadataUrl: 'https://gitlab.com/'
                  //metadataAbstract: "New WMS Abstract"
                },
                {
                  //voir dans Toutes les entités de la terre
                  layerName: 'woodedarea_50k',
                  title: 'New WMS name with new abstract'
                  //metadataUrl: "https://www.quebec.ca/",
                  //metadataAbstract: "New 2nd WMS abstract"
                },
                {
                  layerName: '*',
                  //metadataUrlAll: "https://quebec.ca/",
                  metadataAbstractAll: 'New WMS abstract to all layers'
                }
              ]
              //regFilters: ["^100$"]
            },
            {
              // wms CORS error link
              id: 'wms_cors_error',
              url: 'https://daata.chs-shc.ca/geoserver/wms',
              type: 'wms',
              version: '1.3.0'
            },
            {
              // wms working link
              id: 'wms_cors_error',
              url: 'https://cartes.geogratis.gc.ca/wms/canvec_fr',
              type: 'wms',
              version: '1.3.0',
              regFilters: ['hydro_obstacle_polygon_50k']
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
              id: 'wms',
              url: 'https://cartes.geogratis.gc.ca/wms/canvec_fr',
              type: 'wms',
              setCrossOriginAnonymous: true,
              version: '1.3.0'
            },
            {
              id: 'Gououvert',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
              regFilters: ['zpegt'],
              groupImpose: { id: 'zpegt', title: 'zpegt' }
            },
            {
              // Carte topo échelle 1/20 000
              id: 'rn_wmts_1',
              url: 'https://servicesmatriciels.mern.gouv.qc.ca/erdas-iws/ogc/wmts/Cartes_Images',
              type: 'wmts',
              setCrossOriginAnonymous: true,
              matrixSet: 'EPSG_3857',
              version: '1.0.0',
              forcedProperties: [
                {
                  // le dernier de Entités toponymiques
                  layerName: 'BDTQ-20K_Allegee',
                  title: 'New WMTS name with new metadata URL',
                  metadataUrl: 'https://gitlab.com/'
                },
                {
                  //voir dans Toutes les entités de la terre
                  layerName: 'BDTQ-20K',
                  title: 'New WMTS name with new abstract',
                  metadataAbstract: 'New WMTS abstract'
                },
                {
                  layerName: '*'
                  //metadataUrlAll: "https://www.donneesquebec.ca/",
                  //metadataAbstractAll: "New WMTS abstract to all layers"
                }
              ],
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
    monitoring: {
      provider: 'sentry',
      dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      identifyUser: true
    },
    searchSources: {
      storedqueriesreverse: { enabled: false },
      storedqueries: {
        available: true,
        title: 'Feuillets SNRC',
        searchUrl: '/ws/mffpecofor.fcgi',
        storedquery_id: 'sq250et20kFeuillet',
        fields: [{ name: 'no_feuillet', defaultValue: '0' }],
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
        },
        showAdvancedSettings: true
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
