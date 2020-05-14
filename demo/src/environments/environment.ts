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
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/swtq',
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
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/swtq',
          regFilters: ['zpegt']
        },
        {
          id: 'catalogwithtooltipcontrol',
          title: 'Controling tooltip format',
          url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
          tooltipType: 'abstract' // or title
        },
        {
          id: 'fusion_catalog',
          title: '(composite catalog) fusion catalog',
          composite: [
            {
              id: 'tq_swtq',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/swtq'
            },
            {
              id: 'rn_wmts',
              url: 'https://servicesmatriciels.mern.gouv.qc.ca/erdas-iws/ogc/wmts/Cartes_Images',
              type: 'wmts',
              crossOrigin: true,
              matrixSet: 'EPSG_3857',
              version: '1.0.0'
            }
          ]
        },
        {
          id: 'group_impose',
          title: '(composite catalog) group imposed and unique layer title for same source',
          composite: [
            {
              id: 'tq_swtq',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/swtq',
              regFilters: ['zpegt'],
              groupImpose: {id: 'zpegt', title: 'zpegt'}
            },
            {
              id: 'Gououvert',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
              regFilters: ['zpegt'],
              groupImpose: {id: 'zpegt', title: 'zpegt'}
            },
            {
              id: 'Gououvert',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
              regFilters: ['zpegt'],
              groupImpose: {id: 'zpegt', title: 'zpegt'}
            },
            {
              id: 'rn_wmts',
              url: 'https://servicesmatriciels.mern.gouv.qc.ca/erdas-iws/ogc/wmts/Cartes_Images',
              type: 'wmts',
              crossOrigin: true,
              matrixSet: 'EPSG_3857',
              version: '1.0.0',
              groupImpose: {id: 'cartetopo', title: 'Carte topo échelle 1/20 000'}
            }
          ]
        },
        {
          id: 'tag_layernametitle',
          title: '(composite catalog) tag source on same layer title',
          composite: [
            {
              id: 'tq_swtq',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/swtq',
              regFilters: ['limtn_charg'],
              groupImpose: {id: 'mix_swtq_gouv', title: 'mix same name layer'}
            },
            {
              id: 'Gououvert',
              url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/igo_gouvouvert.fcgi',
              regFilters: ['limtn_charg'],
              groupImpose: {id: 'mix_swtq_gouv', title: 'mix same name layer'}
            }
          ]
        }
      ]
    },
    searchSources: {
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
        searchUrl: '/apis/layers/search',
        order: 4,
        enabled: true,
        params: {
          limit: '5'
        }
      }
    },

    introOptions : {
      skipLabel: '<h3 style="color:blue">Fermer </h3>',
      nextLabel: '<h3 style="color:blue">Suivant</h3>',
      prevLabel: '',
      doneLabel: 'Terminer',
      hidePrev: true,
      hideNext: true,
      positionPrecedence: ['right', 'bottom', 'top', 'left'],

      keyboardNavigation: true,
      showStepNumbers: false,
      showBullets: true,
      showProgress: false,
      showButtons: true,
      disableInteraction: true,
      exitOnOverlayClick: false,
      helperElementPadding: 2,
      scrollToElement: true,
      scrollTo: 'element',
      scrollPadding: 200,
      // overlayOpacity: 0.8,
      highlightClass: 'igo-introjs-helperLayer',
      // buttonClass: "mat-raised-button",
      tooltipClass: 'mat-h2',

      steps: [
        {
          no: 0,
          element: 'igo-logo',
          intro: 'igo-logo  (ex. class)',
          position: 'bottom',
        },
        {
          no: 1,
          element: 'igo-title',
          intro: 'igo-title (ex. Id)',
          position: 'bottom',
        },

        {
          no: 2,
          element: 'aucun',
          action: 'clickOnTool33',
          // element: document.getElementsByClassName('mat-list-item')[33].click(),
          intro: 'CLICK on context <br> <strong> step config -> action: clickOnTool33</strong>',
          position: 'bottom',
        },
        {
          no: 3,
          element: 'igo-panel-title',
          intro: 'igo-panel-title',
          position: 'bottom',
        },
        {
          no: 5,
          element: 'igo-map-browser',
          intro: 'igo-map-browser',
          position: 'bottom',
        },
        {
          no: 6,
          element: 'igo-list',
          intro: 'igo-list',
        },
        {
          no: 7,
          element: 'igo-context-item:nth-child(3)',
          intro: 'igo-context-item:nth-child(3)<br>NB: pour la mise en surbrillance l\'index pour nth-child debute a 1 donc index 3= 3e contexte de la liste',
          position: 'bottom',
        },
        {
          no: 8,
          element: 'aucun',
          action: 'clickOnContext2',
          intro: 'Click on context index 2 <br> step config -> action: clickOnContext2 <br> NB: Ici index de la liste de contexte débute a 0, donc clickOnContext2 = click sur le 3e context'
        },
        {
          no: 9,
          element: 'igo-layer-list',
          intro: 'igo-layer-list <br> problem sur le scroll dans lib mais est ok dans assemblage',
        },
        {
          no: 10,
          element: 'igo-layer-item:nth-child(2)',
          intro: 'igo-layer-item:nth-child(2) <br> NB: pour la mise en surbrillance index pour nth-child debute a 1 <strong> DANS CE CAS-CI le filtre de couche est présent</strong> et ce dernier prend le 1er index donc pour sélectionner le 1er layer de la liste on doit indiquer ->igo-layer-item:nth-child(2)',
        },
        {
          no: 11,
          element: 'igo-layer-item:nth-child(2) button',
          intro: 'eye button',
        },
        {
          no: 12,
          element: 'igo-layer-item:nth-child(2) button',
          intro: "click sur bouton oeil ->  element: 'igo-layer-item:nth-child(2) button'   -  action: 'clickOnElem'",
          action: 'clickOnElem',
        }
      ]
    },

    introOptionsMeasurer : {
      skipLabel: '<h3 style="color:blue">Fermer </h3>',
      nextLabel: '<h3 style="color:blue">Suivant</h3>',
      prevLabel: '',
      doneLabel: 'Terminer',
      hidePrev: true,
      hideNext: true,
      positionPrecedence: ['right', 'bottom', 'top', 'left'],

      keyboardNavigation: true,
      showStepNumbers: false,
      showBullets: true,
      showProgress: false,
      showButtons: true,
      disableInteraction: true,
      exitOnOverlayClick: false,
      helperElementPadding: 2,
      scrollToElement: true,
      scrollTo: 'element',
      scrollPadding: 200,
      highlightClass: 'igo-introjs-helperLayer',
      tooltipClass: 'mat-h2',

      steps: [
        {
          no: 0,
          element: 'mat-button-toggle-1-button',
          intro: 'test',
          position: 'bottom',
        },
        {
          no: 1,
          element: 'div.mat-button-toggle-ripple',
          intro: 'test 2',
          position: 'bottom',
        },

        {
          no: 2,
          element: 'span.mat-slide-toggle-content',
          intro: 'tes3',
          position: 'bottom',
        },
        {
          no: 3,
          element: 'igo-measurer div div mat-slide-toggle:nth-child(1) div',
          intro: 'slider',
          position: 'left',
        },
        {
          no: 4,
          element: 'igo-measurer div div mat-slide-toggle:nth-child(1) div',
          intro: 'slider click',
          action: 'clickOnElem',
          position: 'left',
        }

      ]
    },

    introOptionsContextsList : {
      skipLabel: '<h3 style="color:blue">Fermer </h3>',
      nextLabel: '<h3 style="color:blue">Suivant</h3>',
      prevLabel: '',
      doneLabel: 'Terminer',
      hidePrev: true,
      hideNext: true,
      positionPrecedence: ['right', 'bottom', 'top', 'left'],

      keyboardNavigation: true,
      showStepNumbers: false,
      showBullets: true,
      showProgress: false,
      showButtons: true,
      disableInteraction: true,
      exitOnOverlayClick: false,
      helperElementPadding: 2,
      scrollToElement: true,
      scrollTo: 'element',
      scrollPadding: 200,
      highlightClass: 'igo-introjs-helperLayer',
      tooltipClass: 'mat-h2',

      steps: [
        {

          element: 'rien',
          intro: 'Tour pour le context list',
        }
      ]
    },

    introOptionsLayers : {
      skipLabel: '<h3 style="color:blue">Fermer </h3>',
      nextLabel: '<h3 style="color:blue">Suivant</h3>',
      prevLabel: '',
      doneLabel: 'Terminer',
      hidePrev: true,
      hideNext: true,
      positionPrecedence: ['right', 'bottom', 'top', 'left'],

      keyboardNavigation: true,
      showStepNumbers: false,
      showBullets: true,
      showProgress: false,
      showButtons: true,
      disableInteraction: true,
      exitOnOverlayClick: false,
      helperElementPadding: 2,
      scrollToElement: true,
      scrollTo: 'element',
      scrollPadding: 200,
      highlightClass: 'igo-introjs-helperLayer',
      tooltipClass: 'mat-h2',

      steps: [
        {

          element: 'rien',
          intro: 'Tour pour Layers',
        }
      ]
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
