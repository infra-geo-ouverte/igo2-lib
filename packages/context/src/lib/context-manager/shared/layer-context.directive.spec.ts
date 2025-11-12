import { TestBed } from '@angular/core/testing';
import { Params } from '@angular/router';

import { ConfigService } from '@igo2/core/config';
import { RouteServiceOptions } from '@igo2/core/route';
import {
  AnyLayer,
  ImageLayer,
  ImageLayerOptions,
  MapBrowserComponent,
  TileLayer,
  TileLayerOptions,
  WMSDataSource,
  WMSDataSourceOptions,
  WMTSDataSource,
  WMTSDataSourceOptions
} from '@igo2/geo';
import { LayerService } from '@igo2/geo';
import { StyleListService, StyleService } from '@igo2/geo';

import { mergeTestConfig } from 'packages/context/test-config';
import { BehaviorSubject } from 'rxjs';

import { ShareMapService } from '../../share-map/shared/share-map.service';
import { ContextService } from './context.service';
import { LayerContextDirective } from './layer-context.directive';

const ROUTE_OPTION_MOCK: RouteServiceOptions = {
  visibleOnLayersKey: 'visiblelayers',
  visibleOffLayersKey: 'invisiblelayers'
};
const tileLayerOptions: TileLayerOptions = {
  id: 'carte_gouv_qc_ro',
  visible: true,
  zIndex: 11,
  opacity: 1,
  title: 'Quebec Base Map',
  sourceOptions: {
    type: 'wmts',
    url: 'https://geoegl.msp.gouv.qc.ca/apis/carto/wmts/1.0.0/wmts',
    layer: 'carte_gouv_qc_ro',
    matrixSet: 'EPSG_3857',
    version: '1.3.0'
  }
};

function createWmtsLayer(options: TileLayerOptions): TileLayer {
  options.source = new WMTSDataSource(
    options.sourceOptions as WMTSDataSourceOptions
  );
  const layer = new TileLayer(options);
  return layer;
}

const imageLayerOptions: ImageLayerOptions = {
  id: 'etablissement_mtq',
  visible: false,
  zIndex: 11,
  opacity: 1,
  title: 'Établissements MTQ',
  sourceOptions: {
    type: 'wms',
    url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
    params: {
      LAYERS: 'etablissement_mtq',
      VERSION: '1.3.0'
    }
  }
};

function createWmsLayer(options: ImageLayerOptions): ImageLayer {
  options.source = new WMSDataSource(
    options.sourceOptions as WMSDataSourceOptions
  );
  const layer = new ImageLayer(options);
  return layer;
}

describe('LayerContextDirective', () => {
  let directive: LayerContextDirective;
  let mockContextService: jasmine.SpyObj<ContextService>;
  let mockShareMapService: jasmine.SpyObj<ShareMapService>;
  let mockWmsLayer: AnyLayer;
  let mockWmtsLayer: AnyLayer;

  beforeEach(() => {
    const mockRouteService = jasmine.createSpyObj(
      'RouteService',
      ['queryParams'],
      {
        options: ROUTE_OPTION_MOCK
      }
    );
    mockContextService = jasmine.createSpyObj('ContextService', [], {
      context$: new BehaviorSubject({ uri: 'mockContextUri' })
    });
    mockShareMapService = jasmine.createSpyObj(
      'ShareMapService',
      ['getContext'],
      {
        optionsLegacy: {},
        keysDefinitions: {},
        routeService: mockRouteService
      }
    );
    mockShareMapService.getContext.and.returnValue('mockContextUri');

    TestBed.configureTestingModule(
      mergeTestConfig({
        providers: [
          LayerContextDirective,
          { provide: MapBrowserComponent, useValue: {} },
          { provide: ContextService, useValue: mockContextService },
          { provide: LayerService, useValue: {} },
          { provide: ConfigService, useValue: {} },
          { provide: StyleListService, useValue: {} },
          { provide: StyleService, useValue: {} },
          { provide: ShareMapService, useValue: mockShareMapService }
        ]
      })
    );

    mockWmsLayer = createWmsLayer(imageLayerOptions);
    mockWmtsLayer = createWmtsLayer(tileLayerOptions);
    directive = TestBed.inject(LayerContextDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  describe('#computeLayerVisibilityFromUrl', () => {
    it('should return the default visibility if no queryParams or layer id is provided', () => {
      directive['queryParams'] = {} as Params;
      const result = directive['computeLayerVisibilityFromUrl'](mockWmsLayer);
      expect(result).toBe(false);
    });

    it('should set visibility to true if visibleOnLayersKey is "*"', () => {
      directive['queryParams'] = {
        [ROUTE_OPTION_MOCK.visibleOnLayersKey]: '*'
      } as Params;
      const result = directive['computeLayerVisibilityFromUrl'](mockWmsLayer);
      expect(result).toBe(true);
    });

    it('should set visibility to false if visibleOffLayersKey is "*"', () => {
      directive['queryParams'] = {
        [ROUTE_OPTION_MOCK.visibleOffLayersKey]: '*'
      };
      const result = directive['computeLayerVisibilityFromUrl'](mockWmsLayer);
      expect(result).toBe(false);
    });

    it('should set visibility to true if layer id is in visibleOnLayersKey', () => {
      directive['queryParams'] = {
        [ROUTE_OPTION_MOCK.visibleOnLayersKey]: 'carte_gouv_qc_ro'
      };
      const result = directive['computeLayerVisibilityFromUrl'](mockWmtsLayer);
      expect(result).toBe(true);
    });

    it('should set visibility to false if layer id is in visibleOffLayersKey', () => {
      directive['queryParams'] = {
        [ROUTE_OPTION_MOCK.visibleOffLayersKey]: 'carte_gouv_qc_ro'
      };
      const result = directive['computeLayerVisibilityFromUrl'](mockWmtsLayer);
      expect(result).toBe(false);
    });

    it('should prioritize visibleOffLayersKey over visibleOnLayersKey', () => {
      const layers = [mockWmtsLayer, mockWmsLayer];
      directive['queryParams'] = {
        [ROUTE_OPTION_MOCK.visibleOnLayersKey]: 'etablissement_mtq',
        [ROUTE_OPTION_MOCK.visibleOffLayersKey]: 'carte_gouv_qc_ro'
      };

      const result = layers
        .filter((layer) => layer)
        .map((layer) => {
          layer.visible = directive['computeLayerVisibilityFromUrl'](layer);
          return layer;
        });

      expect(result[0].visible).toBe(false);
      expect(result[1].visible).toBe(true);
    });

    it('the visibility of both layers must be true', () => {
      const layers = [mockWmtsLayer, mockWmsLayer];
      directive['queryParams'] = {
        [ROUTE_OPTION_MOCK.visibleOnLayersKey]:
          'etablissement_mtq,carte_gouv_qc_ro'
      };

      const result = layers
        .filter((layer) => layer)
        .map((layer) => {
          layer.visible = directive['computeLayerVisibilityFromUrl'](layer);
          return layer;
        });

      expect(result[0].visible).toBe(true);
      expect(result[1].visible).toBe(true);
    });
  });
});
