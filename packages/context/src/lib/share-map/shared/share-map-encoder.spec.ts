import { AnyLayerOptions, Layer, findParentId, isLayerItem } from '@igo2/geo';

import { shareMapKeyDefs } from './share-map-definitions';
import { ShareMapEncoder } from './share-map-encoder';
import { LayerParams, ShareMapKeysDefinitions } from './share-map.interface';
import {
  CONTEXT_MOCK,
  MAP_GROUP_MOCK,
  MAP_MOCK,
  MOCK_SHARE_OPTION,
  SHARE_MAP_KEYS_DEFAULT_OPTIONS_MOCK
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
  let EXPECTED_BASE_URL: string;
  let SHARE_MAP_DEFS: ShareMapKeysDefinitions;
  let posStringified: string;
  let mockDocument: Document;

  beforeEach(() => {
    SHARE_MAP_DEFS = shareMapKeyDefs(SHARE_MAP_KEYS_DEFAULT_OPTIONS_MOCK);
    const origin = globalThis?.location?.origin ?? '';
    const pathname = globalThis?.location?.pathname ?? '';
    const search = globalThis?.location?.search ?? '';
    const hash = globalThis?.location?.hash ?? '';
    mockDocument = {
      location: {
        origin,
        pathname,
        search,
        hash,
        get href() {
          return this.origin + this.pathname + this.search + this.hash;
        }
      }
    } as Document;
    const keysDefinitions = shareMapKeyDefs({
      ...SHARE_MAP_KEYS_DEFAULT_OPTIONS_MOCK
    });

    EXPECTED_BASE_URL = `${location.origin}${location.pathname}`;
    const {
      pos,
      pos: { params }
    } = SHARE_MAP_DEFS;

    posStringified = `${pos.key}=${params.center.key + params.center.stringify(MAP_MOCK.viewController.getCenter())}`;
    EXPECTED_BASE_URL = `${EXPECTED_BASE_URL}?${posStringified}`;
    shareMapEncoder = new ShareMapEncoder(keysDefinitions, mockDocument);
  });

  it('should be created', () => {
    expect(shareMapEncoder).toBeTruthy();
  });

  it('should return empty array from generateLayersOptionsByService()', () => {
    shareMapEncoder['context'] = CONTEXT_MOCK;

    const result = shareMapEncoder['generateLayersOptionsByService']([], '');
    expect(result).toEqual([]);
  });

  it('should return formatted array from generateLayersOptionsByService()', () => {
    shareMapEncoder['context'] = CONTEXT_MOCK;
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

    it('should delete pos and urls from url and return new url with tool param', () => {
      const map = MAP_MOCK;
      shareMapEncoder['context'] = CONTEXT_MOCK;
      mockDocument.location.pathname = `${mockDocument.location.pathname}?pos=@-77.51804,48.58602&urls=qsdsd,qsd&tool=about`;

      const result = shareMapEncoder.generateUrl(
        map,
        CONTEXT_MOCK,
        MOCK_SHARE_OPTION,
        undefined
      );

      expect(result).toBe(
        `${location.origin}${location.pathname}?tool=about&${posStringified}&${EXPECTED_LAYERS_QUERY_URL}`
      );
    });

    it('should delete all old params and return url with new params', () => {
      const map = MAP_MOCK;
      shareMapEncoder['context'] = CONTEXT_MOCK;
      mockDocument.location.pathname = `${location.pathname}?pos=@-77.51804,48.58602&urls=qsdsd,qsd`;

      const result = shareMapEncoder.generateUrl(
        map,
        CONTEXT_MOCK,
        MOCK_SHARE_OPTION,
        undefined
      );
      expect(result).toBe(`${EXPECTED_BASE_URL}&${EXPECTED_LAYERS_QUERY_URL}`);
    });

    it('should return url with group', () => {
      const { urlsKey, layers, groups } = SHARE_MAP_DEFS;

      const EXPECTED_URLS = `${urlsKey}=https://gisp.dfo-mpo.gc.ca/arcgis/rest/services/FGP/SmallCraftHarbours_Fr/MapServer`;
      const EXPECTED_LAYERS = `${layers.key}=0,[0]n,3t,0.5o,1pid,1v,3z`;
      const EXPECTED_GROUPS = `${groups.key}=1id,test2t,2z,1v,0e;2id,test1t,1z,1v,0e`;
      const result = shareMapEncoder.generateUrl(
        MAP_GROUP_MOCK,
        CONTEXT_MOCK,
        MOCK_SHARE_OPTION,
        ''
      );

      expect(result).toBe(
        `${EXPECTED_BASE_URL}&${EXPECTED_URLS}&${EXPECTED_LAYERS}&${EXPECTED_GROUPS}`
      );
    });
  });

  describe('findParentId', () => {
    const tree = [
      {
        id: 1,
        title: 'Parent Layer',
        type: 'group',
        children: [
          {
            id: 2,
            title: 'Child Layer'
          },
          {
            id: 3,
            title: 'Group Layer',
            type: 'group',
            children: [
              {
                id: 4,
                title: 'Nested Layer'
              }
            ]
          }
        ]
      }
    ] as AnyLayerOptions[];

    it('should find parent ID for a direct child', () => {
      const target = {
        id: 2,
        title: 'Child Layer'
      } as AnyLayerOptions;
      const parentId = findParentId(tree, target);
      expect(parentId).toBe('1');
    });

    it('should find parent ID for a nested child', () => {
      const target = {
        id: 4,
        title: 'Nested Layer'
      } as AnyLayerOptions;
      const parentId = findParentId(tree as any, target);
      expect(parentId).toBe('1.3');
    });
  });
});
