import { TestBed } from '@angular/core/testing';

import Feature from 'ol/Feature';
import { FeatureLoader } from 'ol/featureloader';
import { ReadOptions } from 'ol/format/Feature';
import Point from 'ol/geom/Point';
import Projection from 'ol/proj/Projection';
import VectorSource from 'ol/source/Vector';

import { FeatureDataSource } from '../../../../datasource/shared/datasources';
import { VectorSourceLoaderDataSource } from '../../../../datasource/shared/datasources/vector-source-loader.interface';
import { LayerService } from '../../layer.service';
import { VectorLayer } from '../vector-layer';
import { VectorLayerFlashAnimator } from './animation/vector-layer-flash-animator';
import {
  VECTOR_LAYER_EXTENSIONS,
  VectorLayerExtension
} from './vector-layer-extension.interface';
import { VectorSourceLoader } from './vector-source-loader';

describe('VectorLayer extensions', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('delegates refresh behavior to its datasource', () => {
    const source = new FeatureDataSource({
      id: 'source-refresh',
      type: 'vector'
    });
    const refresh = vi.spyOn(source, 'refresh');
    const layer = TestBed.inject(LayerService).createLayer({
      id: 'layer-refresh',
      title: 'Refresh layer',
      source
    }) as VectorLayer;

    layer.refresh();

    expect(refresh).toHaveBeenCalledOnce();
  });

  it('applies preload as transient layer state and preserves saveable options', () => {
    const source = new FeatureDataSource({
      id: 'source-preload',
      type: 'vector'
    });
    const options = {
      id: 'layer-preload',
      title: 'Preload layer',
      source,
      visible: false,
      opacity: 0.4,
      minResolution: 2,
      maxResolution: 8,
      preload: {
        bypass: 'all'
      }
    };
    const layer = TestBed.inject(LayerService).createLayer(
      options
    ) as VectorLayer;

    expect(layer.visible).toBe(true);
    expect(layer.opacity).toBe(0);
    expect(layer.minResolution).toBe(0);
    expect(layer.maxResolution).toBe(Infinity);
    expect(options.visible).toBe(false);
    expect(options.opacity).toBe(0.4);
    expect(options.minResolution).toBe(2);
    expect(options.maxResolution).toBe(8);
    expect(layer.saveableOptions).toMatchObject({
      visible: false,
      opacity: 0.4,
      preload: options.preload
    });

    source.ol.dispatchEvent('featuresloadend');

    expect(layer.visible).toBe(false);
    expect(layer.opacity).toBe(0.4);
    expect(layer.minResolution).toBe(2);
    expect(layer.maxResolution).toBe(8);
  });

  it('restores preload state when vector loading fails', () => {
    const source = new FeatureDataSource({
      id: 'source-preload-error',
      type: 'vector'
    });
    const layer = TestBed.inject(LayerService).createLayer({
      id: 'layer-preload-error',
      title: 'Preload error layer',
      source,
      visible: false,
      preload: { bypass: 'visibility' }
    }) as VectorLayer;

    expect(layer.visible).toBe(true);

    source.ol.dispatchEvent('featuresloaderror');

    expect(layer.visible).toBe(false);
  });

  it('bypasses and restores resolution during preload', () => {
    const source = new FeatureDataSource({
      id: 'source-preload-resolution',
      type: 'vector'
    });
    const layer = TestBed.inject(LayerService).createLayer({
      id: 'layer-preload-resolution',
      title: 'Preload resolution layer',
      source,
      minResolution: 2,
      maxResolution: 8,
      preload: { bypass: 'resolution' }
    }) as VectorLayer;

    expect(layer.opacity).toBe(0);
    expect(layer.minResolution).toBe(0);
    expect(layer.maxResolution).toBe(Infinity);

    source.ol.dispatchEvent('featuresloadend');

    expect(layer.opacity).toBe(1);
    expect(layer.minResolution).toBe(2);
    expect(layer.maxResolution).toBe(8);
  });

  it('orders middleware by priority, binds instances, completes once, and tears down in reverse', () => {
    const events: string[] = [];
    const highPriorityExtension: VectorLayerExtension = {
      id: 'high-priority',
      priority: 10,
      supports: () => true,
      attach: () => {
        events.push('attach-high');
        return {
          interceptLoad(request, next) {
            events.push(`load-${this === undefined ? 'unbound' : 'high'}`);
            next(request);
          },
          destroy: () => events.push('destroy-high')
        };
      }
    };
    const lowPriorityExtension: VectorLayerExtension = {
      id: 'low-priority',
      priority: 0,
      supports: () => true,
      attach: () => {
        events.push('attach-low');
        return {
          interceptLoad(request) {
            events.push(`load-${this === undefined ? 'unbound' : 'low'}`);
            request.success([]);
            request.success([]);
            request.failure();
          },
          destroy: () => events.push('destroy-low')
        };
      }
    };
    const unsupportedExtension: VectorLayerExtension = {
      id: 'unsupported',
      supports: () => false,
      attach: vi.fn(() => ({ destroy: vi.fn() }))
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: VECTOR_LAYER_EXTENSIONS,
          useValue: lowPriorityExtension,
          multi: true
        },
        {
          provide: VECTOR_LAYER_EXTENSIONS,
          useValue: unsupportedExtension,
          multi: true
        },
        {
          provide: VECTOR_LAYER_EXTENSIONS,
          useValue: highPriorityExtension,
          multi: true
        }
      ]
    });

    const source = new FeatureDataSource({
      id: 'source-1',
      type: 'vector',
      url: 'https://example.com/features'
    });
    let installedLoader: FeatureLoader | undefined;
    vi.spyOn(source.ol, 'setLoader').mockImplementation((loader) => {
      installedLoader = loader;
    });
    const layer = TestBed.inject(LayerService).createLayer({
      id: 'layer-1',
      title: 'Layer 1',
      source
    }) as VectorLayer;
    const success = vi.fn();
    const failure = vi.fn();

    expect(installedLoader).toBeDefined();
    installedLoader!(
      [0, 0, 10, 10],
      1,
      new Projection({ code: 'EPSG:3857' }),
      success,
      failure
    );

    expect(events).toEqual([
      'attach-high',
      'attach-low',
      'load-high',
      'load-low'
    ]);
    expect(unsupportedExtension.attach).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalledOnce();
    expect(failure).not.toHaveBeenCalled();

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    layer.remove();
    layer.remove();

    expect(events.slice(-2)).toEqual(['destroy-low', 'destroy-high']);
  });

  it('rolls back attached extensions when a later attachment fails', () => {
    const destroy = vi.fn();
    const attachedExtension: VectorLayerExtension = {
      id: 'attached',
      priority: 10,
      supports: () => true,
      attach: () => ({ destroy })
    };
    const failingExtension: VectorLayerExtension = {
      id: 'failing',
      supports: () => true,
      attach: () => {
        throw new Error('Attachment failed');
      }
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: VECTOR_LAYER_EXTENSIONS,
          useValue: attachedExtension,
          multi: true
        },
        {
          provide: VECTOR_LAYER_EXTENSIONS,
          useValue: failingExtension,
          multi: true
        }
      ]
    });
    const source = new FeatureDataSource({
      id: 'source-attachment-failure',
      type: 'vector'
    });

    expect(() =>
      TestBed.inject(LayerService).createLayer({
        id: 'layer-attachment-failure',
        title: 'Attachment failure layer',
        source
      })
    ).toThrowError('Attachment failed');
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('continues extension teardown after a destroy failure', () => {
    const events: string[] = [];
    const firstExtension: VectorLayerExtension = {
      id: 'first',
      priority: 10,
      supports: () => true,
      attach: () => ({
        destroy: () => events.push('destroy-first')
      })
    };
    const failingExtension: VectorLayerExtension = {
      id: 'failing',
      supports: () => true,
      attach: () => ({
        destroy: () => {
          events.push('destroy-failing');
          throw new Error('Destroy failed');
        }
      })
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: VECTOR_LAYER_EXTENSIONS,
          useValue: firstExtension,
          multi: true
        },
        {
          provide: VECTOR_LAYER_EXTENSIONS,
          useValue: failingExtension,
          multi: true
        }
      ]
    });
    const source = new FeatureDataSource({
      id: 'source-destroy-failure',
      type: 'vector'
    });
    const layer = TestBed.inject(LayerService).createLayer({
      id: 'layer-destroy-failure',
      title: 'Destroy failure layer',
      source
    }) as VectorLayer;

    expect(() => layer.remove()).toThrowError('Destroy failed');
    expect(events).toEqual(['destroy-failing', 'destroy-first']);
    expect(() => layer.remove()).not.toThrow();
  });

  it('installs and intercepts a loader provided by a datasource capability', () => {
    const interceptLoad = vi.fn((request) => request.success([]));
    const extension: VectorLayerExtension = {
      id: 'wfs-url',
      supports: () => true,
      attach: () => ({ interceptLoad, destroy: vi.fn() })
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: VECTOR_LAYER_EXTENSIONS,
          useValue: extension,
          multi: true
        }
      ]
    });
    const source = new FeatureDataSource({
      id: 'source-capability',
      type: 'vector'
    });
    const capableSource = source as FeatureDataSource &
      VectorSourceLoaderDataSource;
    let sourceLoader: VectorSourceLoader | undefined;
    capableSource.createVectorSourceLoader = vi.fn((host) => {
      sourceLoader = host as VectorSourceLoader;
      const datasourceLoader: FeatureLoader = (
        extent,
        resolution,
        projection,
        success,
        failure
      ) => {
        host.execute({
          source: source.ol,
          url: 'https://example.com/custom-datasource',
          extent,
          resolution,
          projection,
          readOptions: { featureProjection: projection },
          success: success ?? (() => void 0),
          failure: failure ?? (() => void 0)
        });
      };
      return datasourceLoader;
    });
    let installedLoader: FeatureLoader | undefined;
    vi.spyOn(source.ol, 'setLoader').mockImplementation((loader) => {
      installedLoader = loader;
    });
    const layer = TestBed.inject(LayerService).createLayer({
      id: 'layer-capability',
      title: 'Datasource capability layer',
      source
    }) as VectorLayer;

    installedLoader?.(
      [0, 0, 10, 10],
      1,
      new Projection({ code: 'EPSG:3857' }),
      vi.fn(),
      vi.fn()
    );

    expect(capableSource.createVectorSourceLoader).toHaveBeenCalledOnce();
    expect(interceptLoad).toHaveBeenCalledOnce();
    expect(interceptLoad.mock.calls[0][0].url).toContain(
      'https://example.com/custom-datasource'
    );

    const abortRequests = vi.spyOn(sourceLoader!, 'abortRequests');
    layer.remove();

    expect(abortRequests).toHaveBeenCalledOnce();
  });

  it('runs function URL loaders through extension interception', () => {
    const interceptLoad = vi.fn((request) => request.success([]));
    const extension: VectorLayerExtension = {
      id: 'function-url',
      supports: () => true,
      attach: () => ({ interceptLoad, destroy: vi.fn() })
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: VECTOR_LAYER_EXTENSIONS,
          useValue: extension,
          multi: true
        }
      ]
    });
    const source = new FeatureDataSource({
      id: 'source-function-url',
      type: 'vector',
      url: 'https://example.com/features'
    });
    source.ol.setUrl(() => 'https://example.com/resolved-features');
    let installedLoader: FeatureLoader | undefined;
    vi.spyOn(source.ol, 'setLoader').mockImplementation((loader) => {
      installedLoader = loader;
    });
    TestBed.inject(LayerService).createLayer({
      id: 'layer-function-url',
      title: 'Function URL layer',
      source
    });

    installedLoader?.(
      [0, 0, 10, 10],
      1,
      new Projection({ code: 'EPSG:3857' }),
      vi.fn(),
      vi.fn()
    );

    expect(installedLoader).toBeDefined();
    expect(interceptLoad).toHaveBeenCalledOnce();
  });

  it('compares all active request extents by value', () => {
    const source = new FeatureDataSource({
      id: 'source-request-extent',
      type: 'vector',
      url: 'https://example.com/features'
    });
    const loader = new VectorSourceLoader({
      executeLoadExtensions: (request, next) => next(request)
    });
    const loaderHarness = loader as unknown as {
      ongoingRequests: Array<{
        xhr: XMLHttpRequest | undefined;
        extent: number[];
        resolution: number;
        source: VectorSource;
      }>;
      shouldAbortRequests(extent: number[], resolution: number): boolean;
    };
    loaderHarness.ongoingRequests = [
      {
        xhr: undefined,
        extent: [0, 0, 10, 10],
        resolution: 1,
        source: source.ol
      },
      {
        xhr: undefined,
        extent: [0, 0, 10, 10],
        resolution: 1,
        source: source.ol
      }
    ];

    expect(loaderHarness.shouldAbortRequests([0, 0, 10, 10], 1)).toBe(false);
    expect(loaderHarness.shouldAbortRequests([0, 0, 20, 20], 1)).toBe(true);
  });

  it('completes empty responses and routes parser failures to error cleanup', () => {
    const source = new FeatureDataSource({
      id: 'source-response-cleanup',
      type: 'vector',
      url: 'https://example.com/features'
    });
    const loader = new VectorSourceLoader({
      executeLoadExtensions: (request, next) => next(request)
    });
    const loaderHarness = loader as unknown as {
      ongoingRequests: unknown[];
      lastRequest: unknown;
      handleResponse(
        options: {
          request: unknown;
          url: string;
          readOptions: ReadOptions;
          success: (features: unknown[]) => void;
          failure: () => void;
        },
        content: string | ArrayBuffer,
        onError: () => void
      ): void;
    };
    const request = {
      xhr: undefined,
      extent: [0, 0, 10, 10],
      resolution: 1,
      source: source.ol
    };
    loaderHarness.ongoingRequests = [request];
    loaderHarness.lastRequest = request;
    const success = vi.fn();
    const onError = vi.fn();
    const options = {
      request,
      url: 'https://example.com/features',
      readOptions: {},
      success,
      failure: vi.fn()
    };

    loaderHarness.handleResponse(options, '', onError);

    expect(success).toHaveBeenCalledWith([]);
    expect(onError).not.toHaveBeenCalled();
    expect(loaderHarness.ongoingRequests).toEqual([]);

    vi.spyOn(source.ol.getFormat()!, 'readFeatures').mockImplementation(() => {
      throw new Error('Invalid response');
    });
    loaderHarness.handleResponse(options, 'invalid', onError);

    expect(onError).toHaveBeenCalledOnce();
  });

  it('cleans animation and tracking listeners on removal', () => {
    const source = new FeatureDataSource({
      id: 'source-listener-cleanup',
      type: 'vector',
      url: 'https://example.com/features'
    });
    const layer = TestBed.inject(LayerService).createLayer({
      id: 'layer-listener-cleanup',
      title: 'Listener cleanup layer',
      source,
      animation: { duration: 1000 },
      trackFeature: 'tracked-feature'
    }) as VectorLayer;
    const animator = vi.spyOn(VectorLayerFlashAnimator.prototype, 'flash');
    const destroyAnimator = vi.spyOn(
      VectorLayerFlashAnimator.prototype,
      'destroy'
    );
    const lifecycleLayer = layer as unknown as {
      trackFeatureListenerKey: unknown;
    };

    source.ol.addFeature(new Feature(new Point([0, 0])));

    expect(animator).toHaveBeenCalledOnce();
    expect(lifecycleLayer.trackFeatureListenerKey).toBeDefined();

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    layer.remove();
    source.ol.addFeature(new Feature(new Point([1, 1])));

    expect(animator).toHaveBeenCalledOnce();
    expect(destroyAnimator).toHaveBeenCalledOnce();
    expect(lifecycleLayer.trackFeatureListenerKey).toBeUndefined();
  });

  it('stops future animations without affecting the layer lifecycle', () => {
    const source = new FeatureDataSource({
      id: 'source-stop-animation',
      type: 'vector'
    });
    const layer = TestBed.inject(LayerService).createLayer({
      id: 'layer-stop-animation',
      title: 'Stop animation layer',
      source,
      animation: { duration: 1000 }
    }) as VectorLayer;
    const animator = vi.spyOn(VectorLayerFlashAnimator.prototype, 'flash');

    source.ol.addFeature(new Feature(new Point([0, 0])));
    layer.stopAnimation();
    source.ol.addFeature(new Feature(new Point([1, 1])));

    expect(animator).toHaveBeenCalledOnce();
    layer.remove();
  });

  it('loads datasource batches in parallel and emits one ordered aggregated success', () => {
    const source = new FeatureDataSource({
      id: 'source-batch-2',
      type: 'vector',
      url: 'https://example.com/features'
    });
    const callOrder: string[] = [];
    const loader = new VectorSourceLoader({
      executeLoadExtensions: (request, next) => next(request)
    });
    const loaderHarness = loader as unknown as {
      loadUrl(...args: unknown[]): void;
    };
    const pendingLoads: Array<{
      success: (features: unknown[]) => void;
    }> = [];
    vi.spyOn(loaderHarness, 'loadUrl').mockImplementation(
      (...args: unknown[]) => {
        callOrder.push(args[0] as string);
        pendingLoads.push({
          success: args[5] as (features: unknown[]) => void
        });
      }
    );

    const success = vi.fn();
    const failure = vi.fn();

    loader.execute({
      source: source.ol,
      url: 'u-1',
      resolveUrls: () => ['u-1', 'u-2', 'u-3'],
      extent: [0, 0, 10, 10],
      resolution: 1,
      projection: new Projection({ code: 'EPSG:3857' }),
      readOptions: {},
      success,
      failure
    });

    expect(callOrder).toEqual(['u-1', 'u-2', 'u-3']);
    expect(success).not.toHaveBeenCalled();

    pendingLoads[2].success([{ id: 'u-3' }]);
    pendingLoads[0].success([{ id: 'u-1' }]);
    pendingLoads[1].success([{ id: 'u-2' }]);

    expect(success).toHaveBeenCalledOnce();
    expect(success.mock.calls[0][0]).toEqual([
      { id: 'u-1' },
      { id: 'u-2' },
      { id: 'u-3' }
    ]);
    expect(failure).not.toHaveBeenCalled();
  });

  it('rolls back completed datasource batches when a later batch fails', () => {
    const source = new FeatureDataSource({
      id: 'source-batch-failure',
      type: 'vector',
      url: 'https://example.com/features'
    });
    const firstBatchFeature = new Feature(new Point([0, 0]));
    const loader = new VectorSourceLoader({
      executeLoadExtensions: (request, next) => next(request)
    });
    const loaderHarness = loader as unknown as {
      loadUrl(...args: unknown[]): void;
      abortRequestGroup(requestGroup: object): void;
    };
    const requestGroups: object[] = [];
    const abortRequestGroup = vi.spyOn(loaderHarness, 'abortRequestGroup');
    vi.spyOn(loaderHarness, 'loadUrl').mockImplementation(
      (...args: unknown[]) => {
        const url = args[0] as string;
        const success = args[5] as ((features: Feature[]) => void) | undefined;
        const failure = args[6] as (() => void) | undefined;
        requestGroups.push(args[7] as object);
        if (url === 'u-1') {
          source.ol.addFeature(firstBatchFeature);
          success?.([firstBatchFeature]);
          return;
        }
        failure?.();
      }
    );
    const success = vi.fn();
    const failure = vi.fn();

    loader.execute({
      source: source.ol,
      url: 'u-1',
      resolveUrls: () => ['u-1', 'u-2'],
      extent: [0, 0, 10, 10],
      resolution: 1,
      projection: new Projection({ code: 'EPSG:3857' }),
      readOptions: {},
      success,
      failure
    });

    expect(source.ol.hasFeature(firstBatchFeature)).toBe(false);
    expect(success).not.toHaveBeenCalled();
    expect(failure).toHaveBeenCalledOnce();
    expect(requestGroups[0]).toBe(requestGroups[1]);
    expect(abortRequestGroup).toHaveBeenCalledExactlyOnceWith(requestGroups[0]);
  });
});
