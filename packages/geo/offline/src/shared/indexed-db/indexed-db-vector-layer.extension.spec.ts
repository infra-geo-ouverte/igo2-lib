import { TestBed } from '@angular/core/testing';

import type {
  VectorLayerExtensionContext,
  VectorLayerLoadRequest,
  VectorLayerOptions
} from '@igo2/geo';

import OlFeature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import Projection from 'ol/proj/Projection';
import VectorSource from 'ol/source/Vector';

import { of, throwError } from 'rxjs';

import { GeoDB } from '../../geo';
import { LayerDB } from '../../layer';
import { GeoNetworkService } from '../geo-network.service';
import { IndexedDbVectorLayerExtension } from './indexed-db-vector-layer.extension';

describe('IndexedDbVectorLayerExtension interception', () => {
  const geoJsonPayload = JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 1,
        properties: { name: 'feature-1' },
        geometry: { type: 'Point', coordinates: [0, 0] }
      }
    ]
  });

  let geoDBMock: {
    get: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let layerDBMock: {
    delete: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let geoNetworkServiceMock: {
    get: ReturnType<typeof vi.fn>;
  };

  function createContext(): VectorLayerExtensionContext {
    const source = new VectorSource({
      format: new GeoJSON(),
      url: 'https://example.com/wfs'
    });
    const layer = new VectorLayer({ source });

    return {
      id: 'layer-1',
      options: {
        id: 'layer-1',
        title: 'Layer 1',
        sourceOptions: { url: 'https://example.com/wfs' },
        offline: { enabled: true }
      } as VectorLayerOptions,
      layer,
      source,
      requestRender: vi.fn(),
      getStateSnapshot: () => ({
        mapAttached: false,
        visible: true
      })
    };
  }

  function createContextWithOfflineOptions(): VectorLayerExtensionContext {
    const source = new VectorSource({
      format: new GeoJSON(),
      url: 'https://example.com/wfs'
    });
    const layer = new VectorLayer({ source });

    return {
      id: 'layer-2',
      options: {
        id: 'layer-2',
        title: 'Layer 2',
        sourceOptions: { url: 'https://example.com/wfs' },
        offline: { enabled: true, contextUri: 'ctx-a' }
      } as VectorLayerOptions,
      layer,
      source,
      requestRender: vi.fn(),
      getStateSnapshot: () => ({
        mapAttached: false,
        visible: true
      })
    };
  }

  function createRequest(source: VectorSource): {
    request: VectorLayerLoadRequest;
    success: ReturnType<typeof vi.fn>;
    failure: ReturnType<typeof vi.fn>;
  } {
    const success = vi.fn();
    const failure = vi.fn();

    return {
      success,
      failure,
      request: {
        source,
        url: 'https://example.com/wfs',
        extent: [0, 0, 10, 10],
        resolution: 1,
        projection: new Projection({ code: 'EPSG:3857' }),
        success,
        failure
      }
    };
  }

  beforeEach(() => {
    vi.useFakeTimers();

    geoDBMock = {
      get: vi.fn(),
      delete: vi.fn(() => of({})),
      update: vi.fn(() => of({}))
    };

    layerDBMock = {
      delete: vi.fn(() => of({})),
      update: vi.fn(() => of({}))
    };

    geoNetworkServiceMock = {
      get: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        IndexedDbVectorLayerExtension,
        { provide: GeoDB, useValue: geoDBMock },
        { provide: LayerDB, useValue: layerDBMock },
        { provide: GeoNetworkService, useValue: geoNetworkServiceMock }
      ]
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('uses idb payload when available and does not call network fallback', () => {
    geoDBMock.get.mockReturnValue(of(geoJsonPayload));
    geoNetworkServiceMock.get.mockReturnValue(of('unused-network-payload'));

    const extension = TestBed.inject(IndexedDbVectorLayerExtension);
    const context = createContext();
    const instance = extension.attach(context);
    const { request, success, failure } = createRequest(context.source);

    instance.interceptLoad?.(request, vi.fn());
    vi.advanceTimersByTime(800);

    expect(geoDBMock.get).toHaveBeenCalledOnce();
    expect(geoNetworkServiceMock.get).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalledOnce();
    expect(failure).not.toHaveBeenCalled();

    instance.destroy();
  });

  it('uses the persisted base URL key for a resolved WFS request', () => {
    geoDBMock.get.mockReturnValue(of(geoJsonPayload));
    geoNetworkServiceMock.get.mockReturnValue(of('unused-network-payload'));

    const extension = TestBed.inject(IndexedDbVectorLayerExtension);
    const context = createContext();
    const instance = extension.attach(context);
    const { request, success, failure } = createRequest(context.source);
    const resolvedRequest = {
      ...request,
      url: 'https://example.com/wfs?service=WFS&bbox=0,0,10,10'
    };

    instance.interceptLoad?.(resolvedRequest, vi.fn());
    vi.advanceTimersByTime(800);

    expect(geoDBMock.get).toHaveBeenCalledWith('https://example.com/wfs');
    expect(geoNetworkServiceMock.get).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalledOnce();
    expect(failure).not.toHaveBeenCalled();

    instance.destroy();
  });

  it('falls back to network when idb miss occurs', () => {
    geoDBMock.get.mockReturnValue(of(undefined));
    geoNetworkServiceMock.get.mockReturnValue(of(geoJsonPayload));

    const extension = TestBed.inject(IndexedDbVectorLayerExtension);
    const context = createContext();
    const instance = extension.attach(context);
    const { request, success, failure } = createRequest(context.source);

    instance.interceptLoad?.(request, vi.fn());
    vi.advanceTimersByTime(800);

    expect(geoDBMock.get).toHaveBeenCalledOnce();
    expect(geoNetworkServiceMock.get).toHaveBeenCalledOnce();
    expect(success).toHaveBeenCalledOnce();
    expect(failure).not.toHaveBeenCalled();

    instance.destroy();
  });

  it('falls back to network when indexeddb lookup fails', () => {
    geoDBMock.get.mockReturnValue(
      throwError(() => new Error('indexeddb-unavailable'))
    );
    geoNetworkServiceMock.get.mockReturnValue(of(geoJsonPayload));

    const extension = TestBed.inject(IndexedDbVectorLayerExtension);
    const context = createContext();
    const instance = extension.attach(context);
    const { request, success, failure } = createRequest(context.source);

    instance.interceptLoad?.(request, vi.fn());
    vi.advanceTimersByTime(800);

    expect(geoNetworkServiceMock.get).toHaveBeenCalledOnce();
    expect(success).toHaveBeenCalledOnce();
    expect(failure).not.toHaveBeenCalled();

    instance.destroy();
  });

  it('completes exactly once on network failure after idb miss', () => {
    geoDBMock.get.mockReturnValue(of(undefined));
    geoNetworkServiceMock.get.mockReturnValue(
      throwError(() => new Error('network-failure'))
    );

    const extension = TestBed.inject(IndexedDbVectorLayerExtension);
    const context = createContext();
    const instance = extension.attach(context);
    const { request, success, failure } = createRequest(context.source);

    instance.interceptLoad?.(request, vi.fn());
    vi.advanceTimersByTime(800);

    expect(success).not.toHaveBeenCalled();
    expect(failure).toHaveBeenCalledOnce();

    instance.destroy();
  });

  it('supports and intercepts using the offline option', () => {
    geoDBMock.get.mockReturnValue(of(geoJsonPayload));

    const extension = TestBed.inject(IndexedDbVectorLayerExtension);
    const context = createContextWithOfflineOptions();
    const instance = extension.attach(context);
    const { request, success, failure } = createRequest(context.source);

    expect(extension.supports(context.options)).toBe(true);

    instance.interceptLoad?.(request, vi.fn());
    vi.advanceTimersByTime(800);

    expect(success).toHaveBeenCalledOnce();
    expect(failure).not.toHaveBeenCalled();

    instance.destroy();
  });

  it('persists clean feature clones without changing live features', () => {
    const context = createContext();
    const featureStore = { id: 'store-1' };
    const feature = new GeoJSON().readFeature({
      type: 'Feature',
      id: 'feature-1',
      properties: {
        name: 'feature-1',
        _featureStore: featureStore
      },
      geometry: { type: 'Point', coordinates: [0, 0] }
    }) as OlFeature;
    context.source.addFeature(feature);

    const extension = TestBed.inject(IndexedDbVectorLayerExtension);
    const instance = extension.attach(context);
    context.layer.dispatchEvent('sourceready');

    expect(feature.get('_featureStore')).toBe(featureStore);
    expect(geoDBMock.update).toHaveBeenCalledWith(
      'https://example.com/wfs',
      'layer-1',
      expect.objectContaining({
        features: [
          expect.objectContaining({
            id: 'feature-1',
            properties: { name: 'feature-1' }
          })
        ]
      }),
      expect.anything(),
      expect.any(String)
    );

    instance.destroy();
  });

  it('does not overwrite persisted features when a restored source is initially empty', () => {
    const context = createContext();
    const extension = TestBed.inject(IndexedDbVectorLayerExtension);
    const instance = extension.attach(context);

    context.layer.dispatchEvent('sourceready');

    expect(geoDBMock.update).not.toHaveBeenCalled();
    expect(layerDBMock.update).toHaveBeenCalledOnce();

    instance.destroy();
  });

  it('cancels an in-flight indexeddb lookup when destroyed', () => {
    geoDBMock.get.mockReturnValue(of(geoJsonPayload));

    const extension = TestBed.inject(IndexedDbVectorLayerExtension);
    const context = createContext();
    const instance = extension.attach(context);
    const { request, success } = createRequest(context.source);

    instance.interceptLoad?.(request, vi.fn());
    instance.destroy();
    vi.advanceTimersByTime(800);

    expect(success).not.toHaveBeenCalled();
  });
});
