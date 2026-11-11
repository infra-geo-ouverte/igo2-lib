import { inject } from '@angular/core';

import { FeatureLike } from 'ol/Feature';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import { getCenter as getExtentCenter } from 'ol/extent';
import { FeatureLoader, FeatureUrlFunction } from 'ol/featureloader';
import Point from 'ol/geom/Point';
import olLayerVector from 'ol/layer/Vector';
import olSourceVector, { VectorSourceEvent } from 'ol/source/Vector';

import { BehaviorSubject } from 'rxjs';

import { ArcGISRestDataSource } from '../../../../datasource/shared/datasources/arcgisrest-datasource';
import { ClusterDataSource } from '../../../../datasource/shared/datasources/cluster-datasource';
import { Legend } from '../../../../datasource/shared/datasources/datasource.interface';
import { FeatureDataSource } from '../../../../datasource/shared/datasources/feature-datasource';
import { hasVectorSourceLoader } from '../../../../datasource/shared/datasources/vector-source-loader.interface';
import { WebSocketDataSource } from '../../../../datasource/shared/datasources/websocket-datasource';
import { WFSDataSource } from '../../../../datasource/shared/datasources/wfs-datasource';
import type { MapBase, MapExtent } from '../../../../map/shared';
import { AnyStyle } from '../../../../style/shared';
import { isAnyOlStyle } from '../../../../style/shared/style-ol.utils';
import { VectorWatcher } from '../../../utils/vector-watcher';
import { LayerExtensionManager } from '../extension/layer-extension-manager';
import { Layer } from '../layer';
import { LayerType } from '../layer.interface';
import { vectorLayerAnimationExtension } from './animation/vector-layer-animation.extension';
import {
  VECTOR_LAYER_EXTENSIONS,
  VectorLayerExtension,
  VectorLayerExtensionContext,
  VectorLayerExtensionInstance,
  VectorLayerLoadHandler,
  VectorLayerLoadRequest
} from './vector-layer-extension.interface';
import type {
  VectorLayerOptions,
  VectorLayerPreloadOptions
} from './vector-layer.interface';
import { VectorSourceLoader } from './vector-source-loader';

interface VectorLayerPreloadState {
  readonly opacity: number;
  readonly visible: boolean;
  readonly minResolution: number;
  readonly maxResolution: number;
}

export class VectorLayer extends Layer {
  type: LayerType = 'vector';

  declare public dataSource:
    | FeatureDataSource
    | WFSDataSource
    | ArcGISRestDataSource
    | WebSocketDataSource
    | ClusterDataSource;
  declare public options: VectorLayerOptions;
  declare public ol: olLayerVector<olSourceVector>;
  private watcher: VectorWatcher;
  declare private trackFeatureListenerKey: EventsKey | EventsKey[] | undefined;
  // Layer calls createOlLayer before subclass field initializers run.
  declare private extensionManager: LayerExtensionManager<
    VectorLayerOptions,
    VectorLayerExtensionContext,
    VectorLayerExtensionInstance
  >;
  declare private sourceLoader: VectorSourceLoader | undefined;
  private styleRevision = 0;
  private preloadState?: VectorLayerPreloadState;
  private preloadListenerKey?: EventsKey | EventsKey[];

  get browsable(): boolean {
    return this.options.browsable !== false;
  }

  get exportable(): boolean {
    return this.options.exportable !== false;
  }

  override get saveableOptions(): Partial<VectorLayerOptions> {
    const baseOptions = super.saveableOptions as Partial<VectorLayerOptions>;
    return {
      ...baseOptions,
      visible: this.preloadState?.visible ?? baseOptions.visible,
      opacity: this.preloadState?.opacity ?? baseOptions.opacity,
      preload: this.options.preload
    };
  }

  get style(): AnyStyle | undefined {
    return this._style$.getValue();
  }
  set style(value: AnyStyle | undefined) {
    this._style$.next(value);
    this.setStyle(value);
  }
  private _style$ = new BehaviorSubject<AnyStyle | undefined>(undefined);
  public readonly style$ = this._style$.asObservable();

  constructor(options: VectorLayerOptions) {
    super(options);
    const preloadOptions = this.options.preload;
    if (preloadOptions) {
      this.configurePreload(preloadOptions);
    }
    this.watcher = new VectorWatcher(this);
    this.status$ = this.watcher.status$;
    this.style = this.options.style;
  }

  async getLegend(value: AnyStyle): Promise<Legend[] | undefined> {
    const styleLegend = await this.styleService?.getLegend(value);
    if (styleLegend) {
      return [
        {
          html: styleLegend
        }
      ];
    }

    return this.dataSource.getLegend();
  }

  protected createOlLayer(): olLayerVector<olSourceVector> {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source?.ol as olSourceVector,
      sourceOptions: this.options.sourceOptions || this.options.source?.options
    });

    if (this.options.trackFeature) {
      this.enableTrackFeature(this.options.trackFeature);
    }
    const layerStyle = this.options.style;
    const isOlStyle = isAnyOlStyle(layerStyle);
    const vector = new olLayerVector({
      ...olOptions,
      style: isOlStyle ? layerStyle : undefined
    });
    const vectorSource = vector.getSource() as olSourceVector;
    this.configureVectorSourceLoader(vectorSource);

    this.attachExtensions(vector, vectorSource);

    return vector;
  }

  private configureVectorSourceLoader(vectorSource: olSourceVector): void {
    const loader = this.createSourceLoader(vectorSource);

    if (!loader) {
      return;
    }

    const layerLoader = this.createCompletionSafeLoader(loader);
    vectorSource.setLoader(layerLoader);
  }

  private createSourceLoader(
    vectorSource: olSourceVector
  ): FeatureLoader | undefined {
    if (hasVectorSourceLoader(this.dataSource)) {
      return this.dataSource.createVectorSourceLoader(this.getSourceLoader());
    }

    const sourceUrl = vectorSource.getUrl();
    if (!sourceUrl) {
      return undefined;
    }

    return this.createGenericSourceLoader(vectorSource, sourceUrl);
  }

  private createGenericSourceLoader(
    vectorSource: olSourceVector,
    url: string | FeatureUrlFunction
  ): FeatureLoader {
    return (extent, resolution, projection, success, failure) => {
      this.getSourceLoader().execute({
        source: vectorSource,
        url,
        extent,
        resolution,
        projection,
        readOptions: {
          extent,
          featureProjection: projection
        },
        success: success ?? (() => void 0),
        failure: failure ?? (() => void 0)
      });
    };
  }

  private async setStyle(value: AnyStyle | undefined): Promise<void> {
    const revision = ++this.styleRevision;
    if (!value) {
      this.ol.setStyle(undefined);
    } else if (this.styleService) {
      const olStyle = await this.styleService.getStyle(value, this.ol);
      if (revision === this.styleRevision) {
        this.ol.setStyle(olStyle);
      }
    } else if (isAnyOlStyle(value)) {
      this.ol.setStyle(value);
    }
    // else: no service and non-OL style — silently ignore
  }

  private configurePreload(preloadOptions: VectorLayerPreloadOptions): void {
    this.preloadState = {
      opacity: this.opacity,
      visible: this.visible,
      minResolution: this.minResolution,
      maxResolution: this.maxResolution
    };

    this.opacity = 0;
    if (
      preloadOptions.bypass === 'resolution' ||
      preloadOptions.bypass === 'all'
    ) {
      this.minResolution = 0;
      this.maxResolution = Infinity;
    }
    if (
      preloadOptions.bypass === 'visibility' ||
      preloadOptions.bypass === 'all'
    ) {
      this.visible = true;
    }

    const restoreLayerState = () => {
      const state = this.preloadState;
      if (!state) {
        return;
      }
      this.preloadState = undefined;
      if (this.preloadListenerKey) {
        unByKey(this.preloadListenerKey);
        this.preloadListenerKey = undefined;
      }
      this.opacity = state.opacity;
      if (
        preloadOptions.bypass === 'resolution' ||
        preloadOptions.bypass === 'all'
      ) {
        this.minResolution = state.minResolution;
        this.maxResolution = state.maxResolution;
      }
      if (
        preloadOptions.bypass === 'visibility' ||
        preloadOptions.bypass === 'all'
      ) {
        this.visible = state.visible;
      }
    };
    this.preloadListenerKey = this.dataSource.ol.on(
      ['featuresloadend', 'featuresloaderror'],
      restoreLayerState
    );
  }

  remove(): void {
    try {
      this.cleanupVectorLifecycle();
    } finally {
      super.remove();
    }
  }

  private cleanupVectorLifecycle(): void {
    this.watcher.unsubscribe();
    this.disableTrackFeature();
    if (this.preloadListenerKey) {
      unByKey(this.preloadListenerKey);
      this.preloadListenerKey = undefined;
    }
    this.sourceLoader?.abortRequests();
    this.extensionManager.destroy();
  }

  public init(map: MapBase | undefined) {
    if (map === undefined) {
      this.watcher.unsubscribe();
      return;
    } else {
      this.watcher.subscribe(() => void 0);
    }
    super.init(map);
  }

  public setExtent(extent: MapExtent): void {
    this.options.extent = extent;
  }

  public onUnwatch() {
    this.dataSource.onUnwatch();
    this.stopAnimation();
  }

  public stopAnimation() {
    this.extensionManager
      .getInstance(vectorLayerAnimationExtension)
      ?.stopAnimation();
  }

  public enableTrackFeature(id: string | number): void {
    this.disableTrackFeature();
    this.trackFeatureListenerKey = this.dataSource.ol.on(
      'addfeature',
      (event) => this.trackFeature(id, event)
    );
  }

  public centerMapOnFeature(id: string | number) {
    const feat = this.dataSource.ol.getFeatureById(id);
    if (feat) {
      const geometry = feat.getGeometry();
      if (!geometry) {
        return;
      }

      const center =
        geometry instanceof Point
          ? geometry.getCoordinates()
          : getExtentCenter(geometry.getExtent());

      this.map!.ol.getView().setCenter(center);
    }
  }

  public trackFeature(id: string | number, event: VectorSourceEvent): void {
    if (event.feature?.getId() === id && this.visible) {
      this.centerMapOnFeature(id);
    }
  }

  public disableTrackFeature() {
    if (this.trackFeatureListenerKey) {
      unByKey(this.trackFeatureListenerKey);
      this.trackFeatureListenerKey = undefined;
    }
  }

  private attachExtensions(
    layer: olLayerVector<olSourceVector>,
    source: olSourceVector
  ): void {
    this.extensionManager = new LayerExtensionManager();

    const context: VectorLayerExtensionContext = {
      id: this.id,
      options: this.options,
      layer,
      source,
      requestRender: () => this.map?.ol.render(),
      getStateSnapshot: () => ({
        mapAttached: this.map !== undefined,
        visible: this.visible
      })
    };

    this.extensionManager.attach(
      [vectorLayerAnimationExtension, ...this.getRegisteredExtensions()],
      this.options,
      context
    );
  }

  private getRegisteredExtensions(): readonly VectorLayerExtension[] {
    return inject(VECTOR_LAYER_EXTENSIONS, { optional: true }) ?? [];
  }

  private createCompletionSafeLoader(loader: FeatureLoader): FeatureLoader {
    return (extent, resolution, projection, success, failure) => {
      const onSuccess = success ?? (() => void 0);
      const onFailure = failure ?? (() => void 0);
      let completed = false;
      const successOnce = (features: FeatureLike[]) => {
        if (completed) {
          return;
        }
        completed = true;
        onSuccess(features);
      };
      const failureOnce = () => {
        if (completed) {
          return;
        }
        completed = true;
        onFailure();
      };

      loader(extent, resolution, projection, successOnce, failureOnce);
    };
  }

  private executeLoadExtensions(
    request: VectorLayerLoadRequest,
    baseLoader: VectorLayerLoadHandler
  ): void {
    const interceptors = this.extensionManager
      .getInstances()
      .filter((instance) => !!instance.interceptLoad)
      .map(
        (instance) =>
          (nextRequest: VectorLayerLoadRequest, next: VectorLayerLoadHandler) =>
            instance.interceptLoad!(nextRequest, next)
      );

    const chain = interceptors.reduceRight<VectorLayerLoadHandler>(
      (next, intercept) => {
        return (nextRequest) => intercept(nextRequest, next);
      },
      baseLoader
    );

    chain(request);
  }

  private getSourceLoader(): VectorSourceLoader {
    this.sourceLoader ??= new VectorSourceLoader({
      executeLoadExtensions: (request, baseLoader) =>
        this.executeLoadExtensions(request, baseLoader),
      xhrInterceptor: this.xhrInterceptor
    });

    return this.sourceLoader;
  }
}
