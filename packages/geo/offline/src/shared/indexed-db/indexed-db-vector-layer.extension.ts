import { Injectable, inject } from '@angular/core';

import {
  VectorLayerExtension,
  VectorLayerExtensionContext,
  VectorLayerExtensionInstance,
  VectorLayerLoadHandler,
  VectorLayerLoadRequest,
  VectorLayerOptions,
  isOlFlatStyleLike
} from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import OlFeature from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import * as olformat from 'ol/format';
import { ReadOptions } from 'ol/format/Feature';
import { VectorSourceEvent } from 'ol/source/Vector';

import { EMPTY, Subscription, defer, fromEvent, merge, of } from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  delay,
  first,
  switchMap,
  tap
} from 'rxjs/operators';

import { GeoDB, InsertSourceInsertDBEnum } from '../../geo';
import { LayerDB, LayerDBData } from '../../layer';
import { GeoNetworkService, ResponseType } from '../geo-network.service';

class IndexedDbVectorLayerExtensionInstance implements VectorLayerExtensionInstance {
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly context: VectorLayerExtensionContext,
    private readonly geoDB: GeoDB,
    private readonly layerDB: LayerDB,
    private readonly geoNetworkService: GeoNetworkService
  ) {
    this.registerPersistence();
  }

  interceptLoad(
    request: VectorLayerLoadRequest,
    next: VectorLayerLoadHandler
  ): void {
    if (typeof request.url === 'function') {
      next(request);
      return;
    }

    const requestUrl = request.url;
    const storageKey =
      this.context.options.sourceOptions?.url ||
      this.context.id?.toString() ||
      requestUrl;

    const responseType = this.context.source
      .getFormat()!
      .getType() as ResponseType;
    const getVectorObs$ = defer(() =>
      this.geoNetworkService.get(requestUrl, { responseType })
    ).pipe(first());

    const idbGetVectorObs$ = this.geoDB.get(storageKey).pipe(
      catchError(() => of(undefined)),
      delay(750),
      concatMap((response) => (response ? of(response) : getVectorObs$)),
      tap((content) => this.handleOnLoad(request, content)),
      catchError(() => {
        request.source.removeLoadedExtent(request.extent);
        request.failure();
        return EMPTY;
      })
    );

    this.subscriptions.push(idbGetVectorObs$.subscribe());
  }

  destroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

  private registerPersistence(): void {
    const sourceReady$ = fromEvent<BaseEvent>(
      this.context.layer,
      'sourceready'
    );

    const featurePersistSubscription = sourceReady$
      .pipe(
        tap(() => {
          if (this.context.source.getFeatures().length > 0) {
            this.maintainFeaturesInIdb();
          }
          this.maintainOptionsInIdb();
        }),
        switchMap(() =>
          merge(
            fromEvent<VectorSourceEvent>(
              this.context.source,
              'featuresloadend'
            ),
            fromEvent<VectorSourceEvent>(this.context.source, 'addfeature'),
            fromEvent<VectorSourceEvent>(this.context.source, 'changefeature'),
            fromEvent<VectorSourceEvent>(this.context.source, 'clear'),
            fromEvent<VectorSourceEvent>(this.context.source, 'removefeature')
          )
        )
      )
      .pipe(debounceTime(750))
      .subscribe(() => this.maintainFeaturesInIdb());

    const optionPersistSubscription = sourceReady$
      .pipe(
        switchMap(() =>
          merge(
            fromEvent<BaseEvent>(this.context.layer, 'change'),
            fromEvent<ObjectEvent>(this.context.layer, 'change:visible'),
            fromEvent<ObjectEvent>(this.context.layer, 'change:opacity'),
            fromEvent<ObjectEvent>(this.context.layer, 'change:zIndex')
          )
        )
      )
      .pipe(debounceTime(750))
      .subscribe(() => this.maintainOptionsInIdb());

    this.subscriptions.push(
      featurePersistSubscription,
      optionPersistSubscription
    );
  }

  private maintainOptionsInIdb(): void {
    if (this.context.id === undefined) {
      return;
    }

    const id = this.context.id;
    const options = this.context.options;
    const offline = this.getOfflineState(options);
    const layerData: LayerDBData = ObjectUtils.removeUndefined({
      layerId: id,
      detailedContextUri: offline.contextUri,
      sourceOptions: {
        id,
        type: 'vector',
        queryable: true,
        url: options.sourceOptions?.url
      },
      layerOptions: {
        workspace: options.workspace,
        zIndex: this.context.layer.getZIndex() ?? 1000000,
        id,
        isIgoInternalLayer: options.isIgoInternalLayer,
        title: options.title,
        visible: this.context.layer.getVisible(),
        opacity: this.context.layer.getOpacity(),
        style: isOlFlatStyleLike(options.style) ? options.style : undefined,
        offline: Object.assign({}, options.offline, {
          enabled: true,
          contextUri: offline.contextUri
        })
      },
      insertEvent: `${options.title}-${id}-${new Date()}`
    }) as LayerDBData;

    this.layerDB.update(layerData).pipe(first()).subscribe();
  }

  private maintainFeaturesInIdb(): void {
    if (this.context.id === undefined) {
      return;
    }

    const sourceFeatures = this.context.source.getFeatures().map((feature) => {
      const persistedFeature = feature.clone();
      persistedFeature.setId(feature.getId());
      persistedFeature.unset('_featureStore', true);
      return persistedFeature;
    });

    const geojsonObject = JSON.parse(
      new olformat.GeoJSON().writeFeatures(sourceFeatures, {
        dataProjection: 'EPSG:4326',
        featureProjection: this.context.source.getProjection() || 'EPSG:3857'
      })
    );

    this.geoDB
      .update(
        this.context.options.sourceOptions?.url || this.context.id.toString(),
        this.context.id,
        geojsonObject,
        InsertSourceInsertDBEnum.User,
        `${this.context.options.title}-${this.context.id}-${new Date()}`
      )
      .pipe(first())
      .subscribe();
  }

  private handleOnLoad(
    request: VectorLayerLoadRequest,
    content: string | object | Blob | ArrayBuffer
  ): void {
    const format = request.source.getFormat()!;
    const type = format.getType();
    let source: string | object | Document | Element | ArrayBuffer | Blob;

    switch (type) {
      case 'xml':
        source = new DOMParser().parseFromString(
          content.toString(),
          'application/xml'
        );
        break;
      case 'json':
      case 'text':
      case 'arraybuffer':
      default:
        source = content;
        break;
    }

    const readOptions: ReadOptions = {
      extent: request.extent,
      featureProjection: request.projection
    };
    const features = format.readFeatures(source, readOptions) as OlFeature[];

    if (features) {
      request.source.addFeatures(features);
      request.success(features);
      return;
    }

    request.success([]);
  }

  private getOfflineState(options: VectorLayerOptions): {
    enabled: boolean;
    contextUri: string | undefined;
  } {
    return {
      enabled: options.offline?.enabled === true,
      contextUri: options.offline?.contextUri
    };
  }
}

@Injectable()
export class IndexedDbVectorLayerExtension implements VectorLayerExtension {
  readonly id = 'indexed-db';
  readonly priority = 100;
  private readonly geoDB = inject(GeoDB);
  private readonly layerDB = inject(LayerDB);
  private readonly geoNetworkService = inject(GeoNetworkService);

  supports(options: VectorLayerOptions): boolean {
    return options.offline?.enabled === true;
  }

  attach(context: VectorLayerExtensionContext): VectorLayerExtensionInstance {
    return new IndexedDbVectorLayerExtensionInstance(
      context,
      this.geoDB,
      this.layerDB,
      this.geoNetworkService
    );
  }
}
