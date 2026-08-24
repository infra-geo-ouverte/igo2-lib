import type { HttpClient } from '@angular/common/http';

import OlFeature from 'ol/Feature';
import { Extent } from 'ol/extent';
import { FeatureLoader } from 'ol/featureloader';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as OlLoadingStrategy from 'ol/loadingstrategy';
import * as OlProj from 'ol/proj';
import olProjection from 'ol/proj/Projection';
import olSourceVector from 'ol/source/Vector';

import { Observable, catchError, forkJoin, map } from 'rxjs';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import {
  OgcFilterableDataSourceOptions,
  OgcFiltersOptions
} from '../../../filter/shared/ogc-filter.interface';
import { OGCFilterService } from '../../../filter/shared/ogc-filter.service';
import { DataSource } from './datasource';
import { EventRefresh } from './datasource.interface';
import { VectorSourceLoaderHost } from './vector-source-loader.interface';
import {
  WFSDataSourceOptions,
  WFSDataSourceOptionsParams
} from './wfs-datasource.interface';
import { WFSService } from './wfs.service';
import {
  buildUrl,
  checkWfsParams,
  defaultFieldNameGeometry,
  defaultMaxFeatures,
  getFormatFromOptions,
  getSaveableOgcParams
} from './wms-wfs.utils';

interface FetchFeatureOptions {
  extent: Extent | undefined;
  projection: olProjection;
  httpClient: HttpClient;
}

interface WfsRequestContextOptions {
  extent: Extent | undefined;
  projection: olProjection;
  options?: WFSDataSourceOptions;
  randomParam?: boolean;
  omitBboxWhenNoExtent?: boolean;
}

export interface WfsRequestContext {
  baseUrl: string;
  paramsWFS: WFSDataSourceOptionsParams;
  wfsProjection: olProjection;
  transformedExtent: Extent | undefined;
}

export class WFSDataSource extends DataSource {
  declare public ol: olSourceVector;

  set ogcFilters(value: OgcFiltersOptions) {
    (this.options as OgcFilterableDataSourceOptions).ogcFilters = value;
  }
  get ogcFilters(): OgcFiltersOptions | undefined {
    return (this.options as OgcFilterableDataSourceOptions).ogcFilters;
  }

  get saveableOptions(): Partial<WFSDataSourceOptions> {
    const baseOptions = super.saveableOptions;
    return {
      ...baseOptions,
      params: this.options.params,
      ...(this.ogcFilters && {
        ogcFilters: getSaveableOgcParams(this.ogcFilters) as OgcFiltersOptions // Workaround we force IOgcFiltersOptionSaveable to be detectd as OgcFiltersOptions
      })
    };
  }

  constructor(
    public options: WFSDataSourceOptions,
    protected wfsService: WFSService,
    private ogcFilterService: OGCFilterService
  ) {
    super(checkWfsParams(options, 'wfs'));

    const ogcFilters = (this.options as OgcFilterableDataSourceOptions)
      .ogcFilters;
    const fieldNameGeometry =
      this.options.paramsWFS?.fieldNameGeometry || defaultFieldNameGeometry;
    const ogcFilterWriter = new OgcFilterWriter();
    (this.options as OgcFilterableDataSourceOptions).ogcFilters =
      ogcFilterWriter.defineOgcFiltersDefaultOptions(
        ogcFilters!,
        fieldNameGeometry
      );
    if (
      (this.options as OgcFilterableDataSourceOptions).ogcFilters?.enabled &&
      (this.options as OgcFilterableDataSourceOptions).ogcFilters?.editable &&
      (options.sourceFields || []).filter((sf) => !sf.values).length > 0
    ) {
      this.wfsService.getSourceFieldsFromWFS(this.options);
    }

    if (ogcFilters?.pushButtons) {
      ogcFilters.pushButtons.selectorType = 'pushButton';
    }
    if (ogcFilters?.checkboxes) {
      ogcFilters.checkboxes.selectorType = 'checkbox';
    }
    if (ogcFilters?.radioButtons) {
      ogcFilters.radioButtons.selectorType = 'radioButton';
    }
    if (ogcFilters?.select) {
      ogcFilters.select.selectorType = 'select';
    }
    if (ogcFilters?.autocomplete) {
      ogcFilters.autocomplete.selectorType = 'autocomplete';
    }

    if (options?.ogcFilters?.enabled && options?.ogcFilters?.filters) {
      this.ogcFilterService.setOgcWFSFiltersOptions(this.options);
    }

    this.setOgcFilters(
      (this.options as OgcFilterableDataSourceOptions).ogcFilters!,
      true
    );
  }

  protected createOlSource(): olSourceVector {
    const vectorSource = new olSourceVector({
      format: getFormatFromOptions(this.options),
      strategy: OlLoadingStrategy.bbox
    });
    return vectorSource;
  }

  setOgcFilters(ogcFilters: OgcFiltersOptions, triggerEvent = false) {
    this.ogcFilters = ogcFilters;
    if (triggerEvent) {
      this.ol.notify('ogcFilters', this.ogcFilters);
    }
  }

  public onUnwatch() {
    // empty
  }

  refresh(): void {
    this.properties.set(EventRefresh, Math.random());
    super.refresh();
  }

  fetchFeatures({
    extent,
    projection,
    httpClient
  }: FetchFeatureOptions): Observable<OlFeature<OlGeometry>[]> {
    const requestContext = this.createRequestContext({
      extent,
      projection,
      omitBboxWhenNoExtent: true
    });
    const urls = this.buildRequestUrls(
      requestContext.baseUrl,
      requestContext.paramsWFS
    );

    return forkJoin(
      urls.map((batchUrl) =>
        this._fetchFeatures(requestContext.wfsProjection, batchUrl, {
          extent: requestContext.transformedExtent,
          projection,
          httpClient
        })
      )
    ).pipe(map((featureBatches) => featureBatches.flat()));
  }

  private createRequestContext({
    extent,
    projection,
    options,
    randomParam,
    omitBboxWhenNoExtent = false
  }: WfsRequestContextOptions): WfsRequestContext {
    const effectiveOptions = options ?? this.options;
    const paramsWFS = effectiveOptions.paramsWFS!;
    const wfsProjection = paramsWFS.srsName
      ? new olProjection({ code: paramsWFS.srsName })
      : projection;
    const transformedExtent = extent
      ? OlProj.transformExtent(extent, projection, wfsProjection)
      : undefined;

    paramsWFS.srsName = paramsWFS.srsName || projection.getCode();
    let baseUrl = buildUrl(
      effectiveOptions,
      transformedExtent,
      wfsProjection,
      randomParam
    );

    // Exportation wants to fetch without extent/bbox restrictions.
    if (omitBboxWhenNoExtent && !extent && baseUrl.includes('bbox')) {
      const [urlBase, params] = baseUrl.split('?');
      const paramSegments = params.split('&');
      const paramsWithoutBbox = paramSegments.filter(
        (segment) => !segment.includes('bbox')
      );
      baseUrl = `${urlBase}?${paramsWithoutBbox.join('&')}`;
    }

    return {
      baseUrl,
      paramsWFS,
      wfsProjection,
      transformedExtent
    };
  }

  private buildRequestUrls(
    url: string,
    paramsWFS: WFSDataSourceOptionsParams
  ): string[] {
    if (!this.shouldBatchWfsRequest(paramsWFS)) {
      return [url];
    }

    return buildWfsBatchUrls(url, paramsWFS.maxFeatures ?? 0);
  }

  private shouldBatchWfsRequest(
    paramsWFS: WFSDataSourceOptionsParams
  ): boolean {
    return (
      paramsWFS.version === '2.0.0' &&
      (paramsWFS.maxFeatures ?? 0) > defaultMaxFeatures
    );
  }

  createVectorSourceLoader(
    host: VectorSourceLoaderHost,
    options: WFSDataSourceOptions = this.options,
    randomParam = false
  ): FeatureLoader {
    return (extent, resolution, projection, success, failure) => {
      const requestContext = this.createRequestContext({
        extent,
        projection,
        options: { ...options, ...this.properties.getAll() },
        randomParam
      });

      host.execute({
        source: this.ol,
        url: requestContext.baseUrl,
        extent,
        resolution,
        projection,
        readOptions: {
          dataProjection: requestContext.wfsProjection,
          featureProjection: projection
        },
        resolveUrls: (url) =>
          this.buildRequestUrls(url, requestContext.paramsWFS),
        success: success ?? (() => void 0),
        failure: failure ?? (() => void 0)
      });
    };
  }

  private _fetchFeatures(
    featureProjection: olProjection,
    url: string,
    { extent, projection, httpClient }: FetchFeatureOptions
  ): Observable<OlFeature<OlGeometry>[]> {
    return httpClient.get(url, { responseType: 'text' }).pipe(
      map((response) => {
        return this._parseXmlFeatures(response, projection, featureProjection);
      }),
      catchError((e) => {
        if (extent) this.ol.removeLoadedExtent(extent);
        throw e;
      })
    );
  }

  private _parseXmlFeatures(
    xml: string,
    dataProjection: olProjection,
    featureProjection: olProjection
  ): OlFeature<OlGeometry>[] {
    const features = this.ol.getFormat()!.readFeatures(xml, {
      dataProjection,
      featureProjection
    }) as OlFeature<OlGeometry>[];
    return features;
  }
}

export function buildWfsBatchUrls(
  url: string,
  maxFeatures: number,
  batchSize = 1000
): string[] {
  if (maxFeatures <= batchSize) {
    return [url];
  }

  // Dummy base only to satisfy URL() when `url` is relative; discarded below if so.
  const isProtocolRelativeUrl = url.startsWith('//');
  const parsedUrl = new URL(
    isProtocolRelativeUrl ? `http:${url}` : url,
    'http://igo.local'
  );
  const isAbsoluteUrl = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url);
  const pathEnd = [url.indexOf('?'), url.indexOf('#')]
    .filter((index) => index >= 0)
    .reduce((lowest, index) => Math.min(lowest, index), url.length);
  const originalPath = url.slice(0, pathEnd);
  const urls: string[] = [];

  for (let startIndex = 0; startIndex < maxFeatures; startIndex += batchSize) {
    const batchCount = Math.min(batchSize, maxFeatures - startIndex);
    parsedUrl.searchParams.set('count', batchCount.toString());
    parsedUrl.searchParams.set('startIndex', startIndex.toString());
    parsedUrl.searchParams.delete('maxFeatures');

    urls.push(
      isAbsoluteUrl
        ? parsedUrl.toString()
        : isProtocolRelativeUrl
          ? `//${parsedUrl.host}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
          : `${originalPath}${parsedUrl.search}${parsedUrl.hash}`
    );
  }

  return urls;
}
