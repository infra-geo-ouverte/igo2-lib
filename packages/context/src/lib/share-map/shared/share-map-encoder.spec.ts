import {
  AnyLayerOptions,
  ImageLayer,
  Layer,
  LayerGroup,
  findParentId,
  isLayerItem
} from '@igo2/geo';

import { shareMapKeyDefs } from './share-map-definitions';
import { ShareMapEncoder } from './share-map-encoder';
import { LayerParams, ShareMapKeysDefinitions } from './share-map.interface';
import {
  CONTEXT_MOCK,
  MAP_GROUP_MOCK,
  MAP_MOCK,
  SHARE_MAP_KEYS_DEFAULT_OPTIONS_MOCK,
  imageLayerOptions
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
        zIndex: 3
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
        zIndex: 2
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
        zIndex: 1
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

    const {
      pos,
      pos: { params }
    } = SHARE_MAP_DEFS;
    const value =
      params.center.key +
      params.center.stringify(MAP_MOCK.viewController.getCenter());

    posStringified = `${pos.key}=${encodeURIComponent(value)}`;

    EXPECTED_BASE_URL = `${location.origin}${location.pathname}?${posStringified}`;
    shareMapEncoder = new ShareMapEncoder(keysDefinitions, mockDocument);
  });

  it('should be created', () => {
    expect(shareMapEncoder).toBeTruthy();
  });

  it('should return empty array from generateLayersOptionsByService()', () => {
    shareMapEncoder['context'] = CONTEXT_MOCK;

    const result = shareMapEncoder['generateLayersOptionsByService']([]);
    expect(result).toEqual([]);
  });

  it('should return formatted array from generateLayersOptionsByService()', () => {
    shareMapEncoder['context'] = CONTEXT_MOCK;
    const layers = MAP_MOCK.layerController.layersFlattened.filter(
      isLayerItem
    ) as Layer[];
    const result = shareMapEncoder['generateLayersOptionsByService'](layers);
    expect(result.length).toBe(3);
    expect(result).toEqual(EXPECTED_LAYERS_BY_SERVICE);
  });

  it('should return formatted values from buildLayersQueryValues()', () => {
    const [urls, layerParams] = shareMapEncoder['buildLayersQueryValues'](
      EXPECTED_LAYERS_BY_SERVICE
    );

    const { urlsKey, layers } = SHARE_MAP_DEFS;
    const reconstructed = `${urlsKey}=${urls.join(',')}&${layers.key}=${layerParams.join(';')}`;
    expect(reconstructed).toBe(EXPECTED_LAYERS_QUERY_URL);
  });

  it('should return empty values from buildLayersQueryValues()', () => {
    const [urls, layerParams] = shareMapEncoder['buildLayersQueryValues']([]);
    expect(urls).toEqual([]);
    expect(layerParams).toEqual([]);
  });

  it('should generate URL correctly from generateUrl()', () => {
    const map = MAP_MOCK;
    const result = shareMapEncoder.generateUrl(map, CONTEXT_MOCK);
    const expectedQuery = new URLSearchParams();
    const { urlsKey, layers, pos } = SHARE_MAP_DEFS;
    expectedQuery.set(pos.key, '@-71.51804,46.58602');
    expectedQuery.set(
      urlsKey,
      EXPECTED_LAYERS_QUERY_URL.split('&')[0].split('=')[1]
    );
    expectedQuery.set(
      layers.key,
      EXPECTED_LAYERS_QUERY_URL.split('&')[1].split('=')[1]
    );

    const [baseUrl] = result.split('?');
    const params = new URLSearchParams(result.split('?')[1]);
    expect(baseUrl).toBe(`${location.origin}${location.pathname}`);
    expect(params.toString()).toBe(expectedQuery.toString());
  });

  it('should generate URL with language from generateUrl()', () => {
    const map = MAP_MOCK;
    shareMapEncoder.language = 'en';
    const result = shareMapEncoder.generateUrl(map, CONTEXT_MOCK);

    const params = new URLSearchParams(result.split('?')[1]);
    expect(params.get(SHARE_MAP_DEFS.languageKey)).toBe('en');
  });

  describe('BaseUrl shoud return a clean url', () => {
    it('should return base URL config from getBaseUrlConfig()', () => {
      shareMapEncoder['context'] = CONTEXT_MOCK;

      const map = MAP_MOCK;

      const result = shareMapEncoder['getBaseUrlConfig'](map.viewController);
      expect(
        `${location.origin}${location.pathname}?${result.toString()}`
      ).toBe(`${EXPECTED_BASE_URL}`);
    });

    it('should delete pos and urls from url and return new url with tool param', () => {
      const map = MAP_MOCK;
      shareMapEncoder['context'] = CONTEXT_MOCK;
      mockDocument.location.search = `?pos=@-77.51804,48.58602&urls=qsdsd,qsd&tool=about`;
      // href is origin+pathname+search+hash

      const result = shareMapEncoder.generateUrl(map, CONTEXT_MOCK);
      const params = new URLSearchParams(result.split('?')[1]);
      expect(params.get('tool')).toBe('about');
      expect(params.has('pos')).toBe(true);
      expect(params.has(SHARE_MAP_DEFS.layers.key)).toBe(true);
    });

    it('should delete all old params and return url with new params', () => {
      const map = MAP_MOCK;
      shareMapEncoder['context'] = CONTEXT_MOCK;
      mockDocument.location.search = `?pos=@-77.51804,48.58602&urls=qsdsd,qsd`;

      const result = shareMapEncoder.generateUrl(map, CONTEXT_MOCK);
      const params = new URLSearchParams(result.split('?')[1]);
      expect(params.has(SHARE_MAP_DEFS.pos.key)).toBe(true);
      expect(params.has(SHARE_MAP_DEFS.layers.key)).toBe(true);
    });

    it('should return url with group', () => {
      const { layers, groups } = SHARE_MAP_DEFS;

      const result = shareMapEncoder.generateUrl(MAP_GROUP_MOCK, CONTEXT_MOCK);
      const params = new URLSearchParams(result.split('?')[1]);

      expect(params.has(layers.key)).toBe(true);
      expect(params.has(groups.key)).toBe(true);
      expect(params.get(groups.key)).toContain('1id');
      expect(params.get(groups.key)).toContain('test2t');
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
      const parentId = findParentId(tree, target);
      expect(parentId).toBe('1.3');
    });
  });

  describe('share layer exists in context', () => {
    it('should generate a URL that includes the layer ID when the updated layer belongs to the current context', () => {
      const map = MAP_MOCK;
      const CLONED_CONTETX_MOCK = structuredClone(CONTEXT_MOCK);
      CLONED_CONTETX_MOCK.layers.push({ ...imageLayerOptions, visible: false });
      shareMapEncoder['context'] = CLONED_CONTETX_MOCK;

      const result = shareMapEncoder.generateUrl(map, CLONED_CONTETX_MOCK);
      expect(result).toContain('%2C'); // Comma in urls or layers should be encoded in raw URL
      const params = new URLSearchParams(result.split('?')[1]);
      expect(params.has(SHARE_MAP_DEFS.layers.key)).toBe(true);
      expect(params.get(SHARE_MAP_DEFS.layers.key)).toContain(','); // Decoded value
    });
  });

  describe('Special Characters Encoding', () => {
    it('should encode layer names with special characters', () => {
      const { layers, urlsKey } = SHARE_MAP_DEFS;
      const layerWithComma = {
        dataSource: {
          options: {
            type: 'wms',
            url: 'http://test.com',
            params: { LAYERS: 'name,with,comma' }
          }
        },
        visible: true,
        opacity: 1,
        zIndex: 1,
        type: 'raster',
        options: { id: 'layer1' }
      } as ImageLayer;

      const urlParams = new URLSearchParams();
      shareMapEncoder['buildQueryUrl']([layerWithComma], urlParams);
      const encodedName = encodeURIComponent('name,with,comma');
      expect(urlParams.get(urlsKey)).toBe('http://test.com');
      expect(urlParams.get(layers.key)).toContain(encodedName);
    });

    it('should encode group titles with special characters', () => {
      const { groups } = SHARE_MAP_DEFS;
      const groupWithSpecialChars = {
        id: 'group1',
        title: 'Group, with; special & chars',
        visible: true,
        expanded: true,
        type: 'group',
        options: { id: 'group1' }
      } as LayerGroup;

      const urlParams = new URLSearchParams();
      shareMapEncoder['buildQueryUrl']([groupWithSpecialChars], urlParams);
      const encodedTitle = encodeURIComponent('Group, with; special & chars');
      expect(urlParams.get(groups.key)).toContain(encodedTitle);
    });

    it('should round-trip encode/decode layer names with special characters', () => {
      const originalName = 'name,with,comma&special;chars';

      const encoded =
        SHARE_MAP_DEFS.layers.params.names.stringify(originalName);
      // encoded should be: [name%2Cwith%2Ccomma%26special%3Bchars]

      // Decode: parse it back
      const testParam = `${encoded}n`; // Add the key suffix to simulate URL param
      const decoded = SHARE_MAP_DEFS.layers.params.names.parse(testParam);

      expect(decoded).toBe(originalName);
    });
  });
});
