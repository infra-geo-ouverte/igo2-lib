import { Params } from '@angular/router';

import {
  ArcGISRestImageDataSourceOptions,
  LayerOptions,
  WMSDataSourceOptions
} from '@igo2/geo';

import { ShareMapLegacyParser } from './share-map-legacy.service';
import { ROUTE_OPTION_LEGACY_MOCK } from './share-map.mock';

const iarcgisParams: Params = {
  iarcgisUrl:
    'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/SmallCraftHarbours_Fr/MapServer',
  iarcgisLayers: '(2:igoz9)',
  visiblelayers: 'eaa3463f7354af3a2b61340c7347bfec'
};

const iarcgisExpected: LayerOptions[] = [
  {
    id: 'eaa3463f7354af3a2b61340c7347bfec',
    visible: true,
    zIndex: 9,
    sourceOptions: {
      type: 'imagearcgisrest',
      url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/SmallCraftHarbours_Fr/MapServer',
      layer: '2',
      queryable: true,
      queryFormat: 'esrijson'
    } as ArcGISRestImageDataSourceOptions
  }
];

const wmsParams: Params = {
  wmsUrl:
    'https://geoegl.msp.gouv.qc.ca/apis/wss/aleas.fcgi,https://geoegl.msp.gouv.qc.ca/apis/wss/historiquesc.fcgi',
  wmsLayers:
    '(points_feux:igoz11,points_feux_historique:igoz9),(msp_risc_evenements_public:igoz10)',
  visiblelayers:
    '9cb8acce3f18a875c255d839a249b045,21ba749c753dcdc24fb79e260cea2894',
  invisiblelayers: '77ed94ebdccd8e99a605d004d48bbd9b'
};

const wmsExpected: LayerOptions[] = [
  {
    id: '8c1678bd7ec9261f459978f1e3257bc2',
    visible: true,
    zIndex: 11,
    sourceOptions: {
      type: 'wms',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/historiquesc.fcgi',
      params: {
        LAYERS: 'risc_evenement_igo_public_debby2024'
      }
    } as WMSDataSourceOptions
  },
  {
    id: 'da8f56d2068d1c520d5ea6e228e34853',
    visible: true,
    zIndex: 10,
    sourceOptions: {
      type: 'wms',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/historiquesc.fcgi',
      params: {
        LAYERS: 'msp_risc_evenements_public_24h'
      }
    } as WMSDataSourceOptions
  },
  {
    id: '77ed94ebdccd8e99a605d004d48bbd9b',
    visible: true,
    zIndex: 9,
    sourceOptions: {
      type: 'wms',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/historiquesc.fcgi',
      params: {
        LAYERS: 'msp_risc_evenements_public'
      }
    } as WMSDataSourceOptions
  }
];

describe('ShareMapLegacyParser', () => {
  let service: ShareMapLegacyParser;

  beforeEach(() => {
    service = new ShareMapLegacyParser(ROUTE_OPTION_LEGACY_MOCK);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseUrl', () => {
    it('should parse URL parameters return one layers option', () => {
      const params: Params = {
        wmsUrl: '/apis/wss/historiquesc.fcgi',
        layers: 'msp_delaiss_crue_public_p',
        zoom: '6',
        center: '-72.49505,45.7276'
      };
      const result = service.parseUrl(params);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].sourceOptions).toEqual({
        type: 'wms',
        url: '/apis/wss/historiquesc.fcgi',
        params: {
          LAYERS: 'msp_delaiss_crue_public_p'
        }
      } as WMSDataSourceOptions);
    });

    it('should parse URL parameters return Array with 3 layers options', () => {
      const params: Params = {
        wmsUrl: 'https://geoegl.msp.gouv.qc.ca/apis/wss/historiquesc.fcgi',
        wmsLayers:
          '(risc_evenement_igo_public_debby2024:igoz11,msp_risc_evenements_public_24h:igoz10,msp_risc_evenements_public:igoz9)',
        visiblelayers:
          '8c1678bd7ec9261f459978f1e3257bc2,da8f56d2068d1c520d5ea6e228e34853,77ed94ebdccd8e99a605d004d48bbd9b'
      };

      const result = service.parseUrl(params);
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result).toEqual(wmsExpected);
    });

    it('should return Array with 2 layers visible and one not visible', () => {
      const result = service.parseUrl(wmsParams);
      expect(result).toBeDefined();
      expect(result.length).toBe(3);
      expect(result).toEqual([
        {
          id: '9cb8acce3f18a875c255d839a249b045',
          visible: true,
          zIndex: 11,
          sourceOptions: {
            type: 'wms',
            url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/aleas.fcgi',
            params: {
              LAYERS: 'points_feux'
            }
          } as WMSDataSourceOptions
        },
        {
          id: '21ba749c753dcdc24fb79e260cea2894',
          visible: true,
          zIndex: 9,
          sourceOptions: {
            type: 'wms',
            url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/aleas.fcgi',
            params: {
              LAYERS: 'points_feux_historique'
            }
          } as WMSDataSourceOptions
        },
        {
          id: '77ed94ebdccd8e99a605d004d48bbd9b',
          visible: false,
          zIndex: 10,
          sourceOptions: {
            type: 'wms',
            url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/historiquesc.fcgi',
            params: {
              LAYERS: 'msp_risc_evenements_public'
            }
          } as WMSDataSourceOptions
        }
      ] as LayerOptions[]);
    });

    it('should return Array with one iarcgis layer', () => {
      const result = service.parseUrl(iarcgisParams);
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result).toEqual(iarcgisExpected);
    });

    it('should return Array with one iarcgis layer', () => {
      const mergedParams = {
        ...iarcgisParams,
        ...wmsParams,
        visiblelayers: [
          iarcgisParams.visiblelayers,
          wmsParams.visiblelayers
        ].join(','),
        invisiblelayers: wmsParams.invisiblelayers
      };

      const result = service.parseUrl(mergedParams);

      expect(result).toBeDefined();
      expect(result.length).toBe(4);
      expect(result).toEqual([
        {
          id: '9cb8acce3f18a875c255d839a249b045',
          visible: true,
          zIndex: 11,
          sourceOptions: {
            type: 'wms',
            url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/aleas.fcgi',
            params: {
              LAYERS: 'points_feux'
            }
          } as WMSDataSourceOptions
        },
        {
          id: '21ba749c753dcdc24fb79e260cea2894',
          visible: true,
          zIndex: 9,
          sourceOptions: {
            type: 'wms',
            url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/aleas.fcgi',
            params: {
              LAYERS: 'points_feux_historique'
            }
          } as WMSDataSourceOptions
        },
        {
          id: '77ed94ebdccd8e99a605d004d48bbd9b',
          visible: false,
          zIndex: 10,
          sourceOptions: {
            type: 'wms',
            url: 'https://geoegl.msp.gouv.qc.ca/apis/wss/historiquesc.fcgi',
            params: {
              LAYERS: 'msp_risc_evenements_public'
            }
          } as WMSDataSourceOptions
        },
        {
          id: 'eaa3463f7354af3a2b61340c7347bfec',
          visible: true,
          zIndex: 9,
          sourceOptions: {
            type: 'imagearcgisrest',
            url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/SmallCraftHarbours_Fr/MapServer',
            layer: '2',
            queryable: true,
            queryFormat: 'esrijson'
          } as ArcGISRestImageDataSourceOptions
        }
      ] as LayerOptions[]);
    });

    it('should return Array with layers options params multiple layers', () => {
      const wmsParamsMultipleLayers: Params = {
        wmsUrl:
          'https://servicescarto.mern.gouv.qc.ca/pes/services/Territoire/AQreseauPlus_WMS/MapServer/WMSServer',
        wmsLayers:
          '(Bretelle [3K - 1],Bretelle [13K -3k],Route locale [200K - 25K],Route locale [10K - 1]:igoz9)'
      };

      const result = service.parseUrl(wmsParamsMultipleLayers);
      expect(result).toBeDefined();
      expect(result).toEqual([
        {
          id: 'af78526be82dbbf1e7c28906b9a595b7',
          visible: true,
          zIndex: 9,
          sourceOptions: {
            type: 'wms',
            url: 'https://servicescarto.mern.gouv.qc.ca/pes/services/Territoire/AQreseauPlus_WMS/MapServer/WMSServer',
            params: {
              LAYERS:
                'Bretelle [3K - 1],Bretelle [13K -3k],Route locale [200K - 25K],Route locale [10K - 1]'
            }
          } as WMSDataSourceOptions
        }
      ] as LayerOptions[]);
    });
  });
});
