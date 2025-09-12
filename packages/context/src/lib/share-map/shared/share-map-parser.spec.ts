import { Params } from '@angular/router';

import {
  AnyDataSourceOptions,
  LayerGroupOptions,
  LayerOptions
} from '@igo2/geo';

import { shareMapKeyDefs } from './share-map-definitions';
import { ShareMapParser } from './share-map-parser';
import { PositionParams, ShareMapKeysDefinitions } from './share-map.interface';
import {
  ROUTE_OPTION_LEGACY_MOCK,
  SHARE_MAP_KEYS_DEFAULT_OPTIONS_MOCK
} from './share-map.mock';

const EXPECTED_POSITION: PositionParams = {
  center: [-71.51804, 46.58602],
  zoom: 5,
  rotation: (90 * Math.PI) / 180 // convert 90 degree to radians
};
const EXPECTED_LAYERS_OPTIONS: LayerOptions[] = [
  {
    sourceOptions: {
      type: 'imagearcgisrest',
      url: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/SmallCraftHarbours_Fr/MapServer',
      layer: '0',
      queryable: true,
      queryFormat: 'esrijson'
    } as AnyDataSourceOptions,
    visible: true,
    zIndex: 3,
    opacity: 0.5
  },
  {
    sourceOptions: {
      type: 'wmts',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/carto/wmts/1.0.0/wmts',
      layer: 'carte_gouv_qc_ro',
      version: '1.0.0'
    } as AnyDataSourceOptions,
    visible: false,
    zIndex: 2
  },
  {
    sourceOptions: {
      type: 'wms',
      url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
      params: {
        LAYERS: 'etablissement_mtq'
      }
    } as AnyDataSourceOptions,
    visible: true,
    zIndex: 1
  }
];

const EXPECTED_GROUPS_OPTIONS: LayerGroupOptions[] = [
  {
    id: '1',
    title: 'test2',
    zIndex: 1,
    visible: true,
    expanded: false,
    type: 'group'
  },
  {
    id: '2',
    parentId: '1',
    title: 'test1',
    zIndex: 2,
    visible: true,
    expanded: false,
    type: 'group'
  }
];

const MOCK_PARAMS: Params = {
  urls: 'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/SmallCraftHarbours_Fr/MapServer,https://geoegl.msp.gouv.qc.ca/apis/carto/wmts/1.0.0/wmts,https://ws.mapserver.transports.gouv.qc.ca/swtq',
  ctx: 'contextname',
  layers:
    '0,[0]n,3t,0.5o,1v,3z;1,[carte_gouv_qc_ro]n,1t,0v,2z;2,[etablissement_mtq]n,0t,1v,1z',
  pos: '@-71.51804,46.58602,90r,5z',
  groups: '1id,test2t,1z,1v,0e;2id,test1t,2z,1pid,1v,0e'
};

describe('ShareMapParseUrl', () => {
  let shareMapParseUrl: ShareMapParser;
  let SHARE_MAP_DEFS: ShareMapKeysDefinitions;

  beforeEach(() => {
    const optionsLegacy = ROUTE_OPTION_LEGACY_MOCK;
    SHARE_MAP_DEFS = shareMapKeyDefs(SHARE_MAP_KEYS_DEFAULT_OPTIONS_MOCK);
    shareMapParseUrl = new ShareMapParser(SHARE_MAP_DEFS, optionsLegacy);
  });

  it('should be created', () => {
    expect(shareMapParseUrl).toBeTruthy();
  });

  it('should correctly parse a position string', () => {
    const result = shareMapParseUrl.parsePosition({
      pos: '@-71.51804,46.58602'
    });
    expect(result).toEqual({ center: [-71.51804, 46.58602] });
  });

  it('should correctly parse valid URL layers parameters into expected result', () => {
    const { groups, ...rest } = MOCK_PARAMS;
    const result = shareMapParseUrl.parseLayers({ ...rest });
    expect(result).toBeDefined();
    expect(result).toEqual(EXPECTED_LAYERS_OPTIONS);
  });

  it('should return undefined for layersOptions when parameters are missing', () => {
    const params = {
      urls: MOCK_PARAMS[SHARE_MAP_DEFS.urlsKey],
      ctx: MOCK_PARAMS[SHARE_MAP_DEFS.contextKey]
    };
    const result = shareMapParseUrl.parseLayers(params);

    expect(result.length).toEqual(0);
  });

  it('should parse URL parameters correctly', () => {
    const params: Params = {
      urls: 'https://testgeoegl.msp.gouv.qc.ca/apis/wss/amenagement.fcgi',
      layers: '0,[bgr_v_centr_servc_geomt_act]n,0t,1v,10z',
      pos: '@-71.83131,46.86842,11z'
    };
    const result = shareMapParseUrl.parseLayers(params);
    expect(result).toBeDefined();

    expect(result).toEqual([
      {
        sourceOptions: {
          type: 'wms',
          url: 'https://testgeoegl.msp.gouv.qc.ca/apis/wss/amenagement.fcgi',
          params: { LAYERS: 'bgr_v_centr_servc_geomt_act' }
        } as AnyDataSourceOptions,
        visible: true,
        zIndex: 10
      }
    ]);
  });

  describe('parse position', () => {
    it('should correctly parse a position', () => {
      const parsePosition = shareMapParseUrl.parsePosition({
        pos: '@-71.51804,46.58602'
      });
      expect(parsePosition).toEqual({ center: [-71.51804, 46.58602] });
    });

    it('should return zoom', () => {
      const parsePosition = shareMapParseUrl.parsePosition({
        pos: '13z'
      });
      expect(parsePosition).toEqual({ zoom: 13 });
    });

    it('should return all PositionParams if params exist in input', () => {
      const parsePosition = shareMapParseUrl.parsePosition(MOCK_PARAMS);
      expect(parsePosition).toEqual(EXPECTED_POSITION);
    });
  });

  describe('parse group', () => {
    it('should parse group param and return group list', () => {
      const params = {
        groups: MOCK_PARAMS[SHARE_MAP_DEFS.groups.key],
        ctx: MOCK_PARAMS[SHARE_MAP_DEFS.contextKey]
      };
      const result = shareMapParseUrl.parseLayers(params);

      expect(result.length).toEqual(2);
      expect(result).toEqual(EXPECTED_GROUPS_OPTIONS);
    });
  });
});
