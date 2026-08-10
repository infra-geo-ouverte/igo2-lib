import { IXhrInterceptor } from '@igo2/core/auth';

import OlFeature, { FeatureLike } from 'ol/Feature';
import { Extent, equals as equalsExtent } from 'ol/extent';
import { ReadOptions } from 'ol/format/Feature';
import olSourceVector from 'ol/source/Vector';

import {
  VectorSourceLoadRequest,
  VectorSourceLoaderHost
} from '../../../../datasource/shared/datasources/vector-source-loader.interface';
import {
  VectorLayerLoadHandler,
  VectorLayerLoadRequest
} from './vector-layer-extension.interface';

export interface VectorRequest {
  xhr: XMLHttpRequest | undefined;
  extent: Extent;
  resolution: number;
  source: olSourceVector;
}

interface VectorSourceLoaderDependencies {
  executeLoadExtensions(
    request: VectorLayerLoadRequest,
    baseLoader: VectorLayerLoadHandler
  ): void;
  readonly xhrInterceptor?: IXhrInterceptor | null;
}

interface VectorRequestExecutionOptions {
  readonly request: VectorRequest;
  readonly url: string;
  readonly readOptions: ReadOptions;
  readonly success: (features: FeatureLike[]) => void;
  readonly failure: () => void;
  readonly responseType?: XMLHttpRequestResponseType;
}

interface XhrResolvedRequest {
  readonly xhr: XMLHttpRequest;
  readonly resolvedUrl: string;
}

export class VectorSourceLoader implements VectorSourceLoaderHost {
  private readonly ongoingRequests: VectorRequest[] = [];
  private readonly requestGroups = new WeakMap<VectorRequest, object>();

  constructor(private readonly dependencies: VectorSourceLoaderDependencies) {}

  execute(request: VectorSourceLoadRequest): void {
    this.dependencies.executeLoadExtensions(request, (nextRequest) => {
      if (
        this.shouldAbortRequests(nextRequest.extent, nextRequest.resolution)
      ) {
        this.abortRequests();
      }

      const resolvedUrl =
        typeof nextRequest.url === 'function'
          ? nextRequest.url(
              nextRequest.extent,
              nextRequest.resolution,
              nextRequest.projection
            )
          : nextRequest.url;
      const urls = request.resolveUrls?.(resolvedUrl) ?? [resolvedUrl];
      const readOptions = {
        ...request.readOptions,
        extent: nextRequest.extent,
        featureProjection: nextRequest.projection
      };

      this.loadFeatures(
        urls,
        nextRequest.source,
        nextRequest.extent,
        nextRequest.resolution,
        readOptions,
        nextRequest.success,
        nextRequest.failure
      );
    });
  }

  private loadFeatures(
    urls: readonly string[],
    vectorSource: olSourceVector,
    extent: Extent,
    resolution: number,
    readOptions: ReadOptions,
    success: (features: FeatureLike[]) => void,
    failure: () => void
  ): void {
    if (!urls.length) {
      success([]);
      return;
    }

    if (urls.length === 1) {
      this.loadUrl(
        urls[0],
        vectorSource,
        extent,
        resolution,
        readOptions,
        success,
        failure
      );
      return;
    }

    this.loadFeatureBatches(
      urls,
      vectorSource,
      extent,
      resolution,
      readOptions,
      success,
      failure
    );
  }

  private loadFeatureBatches(
    urls: readonly string[],
    vectorSource: olSourceVector,
    extent: Extent,
    resolution: number,
    readOptions: ReadOptions,
    success: (features: FeatureLike[]) => void,
    failure: () => void
  ): void {
    const loadedFeatures: FeatureLike[][] = [];
    const requestGroup = {};
    let completedBatches = 0;
    let hasFailed = false;

    const rollback = (): void => {
      loadedFeatures
        .flat()
        .forEach((feature) => vectorSource.removeFeature(feature as OlFeature));
    };

    urls.forEach((url, index) => {
      if (hasFailed) {
        return;
      }

      this.loadUrl(
        url,
        vectorSource,
        extent,
        resolution,
        readOptions,
        (features) => {
          if (hasFailed) {
            features.forEach((feature) =>
              vectorSource.removeFeature(feature as OlFeature)
            );
            return;
          }

          loadedFeatures[index] = features;
          completedBatches++;
          if (completedBatches === urls.length) {
            success(loadedFeatures.flat());
          }
        },
        () => {
          if (hasFailed) {
            return;
          }

          hasFailed = true;
          rollback();
          this.abortRequestGroup(requestGroup);
          failure();
        },
        requestGroup
      );
    });
  }

  abortRequests(): void {
    this.abortMatchingRequests(() => true);
  }

  private abortRequestGroup(requestGroup: object): void {
    this.abortMatchingRequests(
      (request) => this.requestGroups.get(request) === requestGroup
    );
  }

  private abortMatchingRequests(
    predicate: (request: VectorRequest) => boolean
  ): void {
    const requests = this.ongoingRequests.filter(predicate);
    for (const request of requests) {
      request.source.removeLoadedExtent(request.extent);
      request.xhr?.abort();
      this.removeRequest(request);
    }
  }

  private shouldAbortRequests(
    currentExtent: Extent,
    resolution: number
  ): boolean {
    return this.ongoingRequests.some(
      (request) =>
        !equalsExtent(request.extent, currentExtent) ||
        request.resolution !== resolution
    );
  }

  private loadUrl(
    url: string,
    vectorSource: olSourceVector,
    extent: Extent,
    resolution: number,
    readOptions: ReadOptions,
    success: (features: FeatureLike[]) => void,
    failure: () => void,
    requestGroup?: object
  ): void {
    const request = this.createVectorRequest(vectorSource, extent, resolution);
    if (requestGroup) {
      this.requestGroups.set(request, requestGroup);
    }
    const responseType =
      vectorSource.getFormat()?.getType() === 'arraybuffer'
        ? 'arraybuffer'
        : undefined;

    this.executeXhrRequest({
      request,
      url,
      readOptions,
      success,
      failure,
      responseType
    });
  }

  private executeXhrRequest(options: VectorRequestExecutionOptions): void {
    const { xhr, resolvedUrl } = this.createConfiguredXhr(
      options.url,
      options.responseType
    );
    const onError = () => this.handleRequestError(options);

    xhr.onerror = onError;
    xhr.onload = () => this.handleRequestLoadEvent(options, xhr, onError);

    this.trackRequest(options.request, xhr);
    try {
      this.dependencies.xhrInterceptor?.interceptXhr(xhr, resolvedUrl);
      xhr.send();
    } catch {
      onError();
    }
  }

  private createConfiguredXhr(
    url: string,
    responseType?: XMLHttpRequestResponseType
  ): XhrResolvedRequest {
    const xhr = new XMLHttpRequest();
    const resolvedUrl =
      this.dependencies.xhrInterceptor?.alterUrlWithKeyAuth(url) ?? url;

    xhr.open('GET', resolvedUrl);
    if (responseType) {
      xhr.responseType = responseType;
    }

    return { xhr, resolvedUrl };
  }

  private handleRequestError(options: VectorRequestExecutionOptions): void {
    options.request.source.removeLoadedExtent(options.request.extent);
    this.removeRequest(options.request);
    options.failure();
  }

  private handleRequestLoadEvent(
    options: VectorRequestExecutionOptions,
    xhr: XMLHttpRequest,
    onError: () => void
  ): void {
    if (xhr.status && (xhr.status < 200 || xhr.status >= 300)) {
      onError();
      return;
    }

    let content: string | ArrayBuffer;
    try {
      content = this.getResponseContent(xhr, options.responseType);
    } catch {
      onError();
      return;
    }

    this.handleResponse(options, content, onError);
  }

  private handleResponse(
    options: VectorRequestExecutionOptions,
    content: string | ArrayBuffer,
    onError: () => void
  ): void {
    if (!content) {
      this.removeRequest(options.request);
      options.success([]);
      return;
    }

    try {
      const format = options.request.source.getFormat();
      if (!format) {
        onError();
        return;
      }

      const source =
        format.getType() === 'xml'
          ? new DOMParser().parseFromString(
              content.toString(),
              'application/xml'
            )
          : content;
      const features = format.readFeatures(source, options.readOptions);

      options.request.source.addFeatures(features);
      this.removeRequest(options.request);
      options.success(features);
    } catch {
      onError();
    }
  }

  private getResponseContent(
    xhr: XMLHttpRequest,
    responseType?: XMLHttpRequestResponseType
  ): string | ArrayBuffer {
    if (responseType !== 'arraybuffer') {
      return xhr.responseText;
    }
    if (xhr.response instanceof ArrayBuffer) {
      return xhr.response;
    }

    throw new TypeError('Expected an ArrayBuffer response');
  }

  private createVectorRequest(
    source: olSourceVector,
    extent: Extent,
    resolution: number
  ): VectorRequest {
    return {
      xhr: undefined,
      extent,
      resolution,
      source
    };
  }

  private trackRequest(request: VectorRequest, xhr: XMLHttpRequest): void {
    request.xhr = xhr;
    this.ongoingRequests.push(request);
  }

  private removeRequest(request: VectorRequest): void {
    const index = this.ongoingRequests.indexOf(request);
    if (index > -1) {
      this.ongoingRequests.splice(index, 1);
    }
  }
}
