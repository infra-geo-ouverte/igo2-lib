import type { HttpClient } from '@angular/common/http';

import { AuthInterceptor } from '@igo2/auth';

import OlFeature from 'ol/Feature';
import { Extent } from 'ol/extent';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import * as OlLoadingStrategy from 'ol/loadingstrategy';
import * as OlProj from 'ol/proj';
import olProjection from 'ol/proj/Projection';
import olSourceVector from 'ol/source/Vector';

import { Observable, catchError, map } from 'rxjs';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import {
  OgcFilterableDataSourceOptions,
  OgcFiltersOptions
} from '../../../filter/shared/ogc-filter.interface';
import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WFSService } from './wfs.service';
import {
  buildUrl,
  checkWfsParams,
  defaultFieldNameGeometry,
  defaultMaxFeatures,
  getFormatFromOptions
} from './wms-wfs.utils';

interface FetchFeatureOptions {
  extent: Extent;
  projection: olProjection;
  httpClient: HttpClient;
}

export class WFSDataSource extends DataSource {
  declare public ol: olSourceVector;

  set ogcFilters(value: OgcFiltersOptions) {
    (this.options as OgcFilterableDataSourceOptions).ogcFilters = value;
  }
  get ogcFilters(): OgcFiltersOptions {
    return (this.options as OgcFilterableDataSourceOptions).ogcFilters;
  }

  get saveableOptions(): Partial<WFSDataSourceOptions> {
    const baseOptions = super.saveableOptions;
    return {
      ...baseOptions,
      params: this.options.params
    };
  }

  constructor(
    public options: WFSDataSourceOptions,
    protected wfsService: WFSService,
    private authInterceptor?: AuthInterceptor
  ) {
    super(checkWfsParams(options, 'wfs'));

    const ogcFilters = (this.options as OgcFilterableDataSourceOptions)
      .ogcFilters;
    const fieldNameGeometry =
      this.options.paramsWFS.fieldNameGeometry || defaultFieldNameGeometry;
    const ogcFilterWriter = new OgcFilterWriter();
    (this.options as OgcFilterableDataSourceOptions).ogcFilters =
      ogcFilterWriter.defineOgcFiltersDefaultOptions(
        ogcFilters,
        fieldNameGeometry
      );
    if (
      (this.options as OgcFilterableDataSourceOptions).ogcFilters.enabled &&
      (this.options as OgcFilterableDataSourceOptions).ogcFilters.editable &&
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

    this.setOgcFilters(
      (this.options as OgcFilterableDataSourceOptions).ogcFilters,
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

  fetchFeatures({
    extent,
    projection,
    httpClient
  }: FetchFeatureOptions): Observable<OlFeature<OlGeometry>[]> {
    const paramsWFS = this.options.paramsWFS;
    const wfsProj = paramsWFS.srsName
      ? new olProjection({ code: paramsWFS.srsName })
      : projection;

    const currentExtent = extent
      ? OlProj.transformExtent(extent, projection, wfsProj)
      : undefined;
    const ogcFilters = this.ogcFilters;

    paramsWFS.srsName = paramsWFS.srsName || projection.getCode();
    let url = buildUrl(this.options, currentExtent, wfsProj, ogcFilters);

    // Exportation want to fetch without extent/bbox restrictions
    if (!extent && url.includes('bbox')) {
      const [baseUrl, params] = url.split('?');
      const paramSegments = params.split('&');
      const paramsWithoutBbox = paramSegments.filter(
        (segment) => !segment.includes('bbox')
      );
      url = `${baseUrl}?${paramsWithoutBbox.join('&')}`;
    }

    let startIndex = 0;
    if (
      paramsWFS.version === '2.0.0' &&
      paramsWFS.maxFeatures > defaultMaxFeatures
    ) {
      const nbOfFeature = 1000;
      while (startIndex < paramsWFS.maxFeatures) {
        let alteredUrl = url.replace(
          'count=' + paramsWFS.maxFeatures,
          'count=' + nbOfFeature
        );
        alteredUrl = alteredUrl.replace('startIndex=0', '0');
        alteredUrl += '&startIndex=' + startIndex;
        alteredUrl.replace(/&&/g, '&');

        return this._fetchFeatures(wfsProj, alteredUrl, {
          extent: currentExtent,
          projection,
          httpClient
        }).pipe(
          map((res) => {
            startIndex += nbOfFeature;
            return res;
          })
        );
      }
    } else {
      return this._fetchFeatures(wfsProj, url, {
        extent: currentExtent,
        projection,
        httpClient
      });
    }
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
    const features = this.ol.getFormat().readFeatures(xml, {
      dataProjection,
      featureProjection
    }) as OlFeature<OlGeometry>[];
    return features;
  }
}
