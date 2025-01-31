import { Location } from '@angular/common';

import { Layer, isLayerItem } from '@igo2/geo';

import { ContextRouteService } from '../../context-manager/shared';
import { shareMapKeyDefs } from './share-map-definitions';
import { ShareMapEncoder } from './share-map-encoder';
import { LayerParams, ShareMapKeysDefinitions } from './share-map.interface';
import {
  CONTEXT_MOCK,
  CONTEXT_ROUTE_KEYS_OPTIONS_MOCK,
  MAP_MOCK,
  MOCK_SHARE_OPTION
} from './share-map.mock';

const EXPECTED_LAYERS_BY_SERVICE: [url: string, layers: LayerParams[]][] = [
  [
    'https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/SmallCraftHarbours_Fr/MapServer',
    [
      {
        index: 0,
        names: '0',
        type: 'imagearcgisrest',
        opacity: 0.5,
        parentId: undefined,
        visible: true,
        zIndex: 3,
        queryString: undefined
      }
    ]
  ],
  [
    'https://geoegl.msp.gouv.qc.ca/apis/carto/wmts/1.0.0/wmts',
    [
      {
        index: 1,
        names: 'carte_gouv_qc_ro',
        type: 'wmts',
        opacity: undefined,
        parentId: undefined,
        visible: false,
        zIndex: 2,
        queryString: undefined
      }
    ]
  ],
  [
    'https://ws.mapserver.transports.gouv.qc.ca/swtq',
    [
      {
        index: 2,
        names: 'etablissement_mtq',
        type: 'wms',
        opacity: undefined,
        parentId: undefined,
        visible: true,
        zIndex: 1,
        queryString: undefined
      }
    ]
  ]
];
const EXPECTED_LAYERS_QUERY_URL: string =
  'urls=https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/SmallCraftHarbours_Fr/MapServer,https://geoegl.msp.gouv.qc.ca/apis/carto/wmts/1.0.0/wmts,https://ws.mapserver.transports.gouv.qc.ca/swtq&layers=0,[0]n,3t,0.5o,1v,3z;1,[carte_gouv_qc_ro]n,1t,0v,2z;2,[etablissement_mtq]n,0t,1v,1z';

describe('ShareMapEncoder', () => {
  let shareMapEncoder: ShareMapEncoder;
  let contextRouteServiceMock: jasmine.SpyObj<ContextRouteService>;
  let locationMock: jasmine.SpyObj<Location>;

  let EXPECTED_BASE_URL: string;
  let SHARE_MAP_DEFS: ShareMapKeysDefinitions;
  let posStringified: string;

  beforeEach(() => {
    contextRouteServiceMock = jasmine.createSpyObj('ContextRouteService', [
      'shareMapKeyDefs',
      'options'
    ]);
    contextRouteServiceMock.options = CONTEXT_ROUTE_KEYS_OPTIONS_MOCK;
    contextRouteServiceMock.shareMapKeyDefs = SHARE_MAP_DEFS = shareMapKeyDefs(
      CONTEXT_ROUTE_KEYS_OPTIONS_MOCK
    );

    locationMock = jasmine.createSpyObj('Location', ['path']);
    locationMock.path.and.callFake(() => location.pathname);
    const mockDocument = {
      location: {
        origin:
          typeof globalThis !== 'undefined' && globalThis.location
            ? globalThis.location.origin
            : ''
      }
    } as Document;
    const keysDefinitions = shareMapKeyDefs({
      ...CONTEXT_ROUTE_KEYS_OPTIONS_MOCK
    });

    EXPECTED_BASE_URL = `${location.origin}${location.pathname}`;
    const {
      pos,
      pos: { params }
    } = SHARE_MAP_DEFS;

    posStringified = `${pos.key}=${params.center.key + params.center.stringify(MAP_MOCK.viewController.getCenter())}`;
    EXPECTED_BASE_URL = `${EXPECTED_BASE_URL}?${posStringified}`;
    shareMapEncoder = new ShareMapEncoder(
      keysDefinitions,
      locationMock,
      mockDocument
    );
  });

  it('should be created', () => {
    expect(shareMapEncoder).toBeTruthy();
  });

  it('should return empty array from generateLayersOptionsByService()', () => {
    const result = shareMapEncoder['generateLayersOptionsByService']([], '');
    expect(result).toEqual([]);
  });

  it('should return formatted array from generateLayersOptionsByService()', () => {
    const layers = MAP_MOCK.layerController.layersFlattened.filter(
      isLayerItem
    ) as Layer[];
    const result = shareMapEncoder['generateLayersOptionsByService'](
      layers,
      MOCK_SHARE_OPTION.layerlistControls.querystring
    );
    expect(result.length).toBe(3);
    expect(result).toEqual(EXPECTED_LAYERS_BY_SERVICE);
  });

  it('should return formatted string from buildLayersQueryUrl()', () => {
    const result = shareMapEncoder['buildLayersQueryUrl'](
      EXPECTED_LAYERS_BY_SERVICE
    );

    expect(result).toBe(EXPECTED_LAYERS_QUERY_URL);
  });

  it('should return empty layers query URL from buildLayersQueryUrl()', () => {
    const result = shareMapEncoder['buildLayersQueryUrl']([]);
    expect(result).toBe(undefined);
  });

  it('should generate URL correctly from generateUrl()', () => {
    const map = MAP_MOCK;
    const result = shareMapEncoder.generateUrl(
      map,
      CONTEXT_MOCK,
      MOCK_SHARE_OPTION,
      ''
    );
    expect(result).toBe(`${EXPECTED_BASE_URL}&${EXPECTED_LAYERS_QUERY_URL}`);
  });

  it('should generate URL with language from generateUrl()', () => {
    const map = MAP_MOCK;
    const result = shareMapEncoder.generateUrl(
      map,
      CONTEXT_MOCK,
      MOCK_SHARE_OPTION,
      'en'
    );

    expect(result).toBe(
      `${EXPECTED_BASE_URL}&${SHARE_MAP_DEFS.languageKey}=en&${EXPECTED_LAYERS_QUERY_URL}`
    );
  });

  describe('BaseUrl shoud return a clean url', () => {
    it('should return base URL config from getBaseUrlConfig()', () => {
      shareMapEncoder['context'] = CONTEXT_MOCK;

      const map = MAP_MOCK;

      const result = shareMapEncoder['getBaseUrlConfig'](
        map.viewController,
        undefined
      );
      expect(result).toBe(`${EXPECTED_BASE_URL}`);
    });

    it('should return clean url with new params', () => {
      shareMapEncoder['context'] = CONTEXT_MOCK;

      locationMock.path.and.returnValue(
        '?tool=about&pos=@-71.51804,46.58602&urls=qsdsd,qsd'
      );
      const map = MAP_MOCK;
      const result = shareMapEncoder['getBaseUrlConfig'](
        map.viewController,
        undefined
      );
      expect(result).toBe(`${location.origin}?tool=about&${posStringified}`);
    });
  });
});
