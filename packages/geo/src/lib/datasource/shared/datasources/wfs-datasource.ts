import olSourceVector from 'ol/source/Vector';
import * as OlLoadingStrategy from 'ol/loadingstrategy';
import olProjection from 'ol/proj/Projection';

import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WFSService } from './wfs.service';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import { OgcFilterableDataSourceOptions, OgcFiltersOptions } from '../../../filter/shared/ogc-filter.interface';
import {
  formatWFSQueryString,
  defaultFieldNameGeometry,
  checkWfsParams,
  getFormatFromOptions,
  defaultMaxFeatures
} from './wms-wfs.utils';
import { AuthInterceptor } from '@igo2/auth';

export class WFSDataSource extends DataSource {
  public ol: olSourceVector;

  constructor(
    public options: WFSDataSourceOptions,
    protected wfsService: WFSService,
    private authInterceptor?: AuthInterceptor
  ) {
    super(checkWfsParams(options, 'wfs'));

    const ogcFilters = (this.options as OgcFilterableDataSourceOptions).ogcFilters;
    const fieldNameGeometry = this.options.paramsWFS.fieldNameGeometry || defaultFieldNameGeometry;
    const ogcFilterWriter = new OgcFilterWriter();
    (this.options as OgcFilterableDataSourceOptions).ogcFilters =
      ogcFilterWriter.defineOgcFiltersDefaultOptions(ogcFilters, fieldNameGeometry);
    if (
      (this.options as OgcFilterableDataSourceOptions).ogcFilters.enabled &&
      (this.options as OgcFilterableDataSourceOptions).ogcFilters.editable
    ) {
      this.wfsService.getSourceFieldsFromWFS(this.options);
    }
  }

  protected createOlSource(): olSourceVector {
    const vectorSource = new olSourceVector({
      format: getFormatFromOptions(this.options),
      loader: (extent, resolution, proj: olProjection) => {
        this.options.paramsWFS.srsName = this.options.paramsWFS.srsName || proj.getCode();
        const url = this.buildUrl(
          extent,
          proj,
          (this.options as OgcFilterableDataSourceOptions).ogcFilters);
        let startIndex = 0;
        if (
          this.options.paramsWFS.version === '2.0.0' &&
          this.options.paramsWFS.maxFeatures > defaultMaxFeatures) {
          const nbOfFeature = 1000;
          while (startIndex < this.options.paramsWFS.maxFeatures) {
            let alteredUrl = url.replace('count=' + this.options.paramsWFS.maxFeatures, 'count=' + nbOfFeature);
            alteredUrl = alteredUrl.replace('startIndex=0', '0');
            alteredUrl += '&startIndex=' + startIndex;
            alteredUrl.replace(/&&/g, '&');
            this.getFeatures(vectorSource, extent, alteredUrl, nbOfFeature);
            startIndex += nbOfFeature;
          }
        } else {
          this.getFeatures(vectorSource, extent, url, this.options.paramsWFS.maxFeatures);
        }


      },
      strategy: OlLoadingStrategy.bbox
    });
    return vectorSource;
  }

  private getFeatures(vectorSource: olSourceVector, extent, url: string, threshold: number) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    this.authInterceptor.interceptXhr(xhr, url);
    const onError = () => vectorSource.removeLoadedExtent(extent);
    xhr.onerror = onError;
    xhr.onload = () => {
      if (xhr.status === 200) {
        const features = vectorSource.getFormat().readFeatures(xhr.responseText);
        // TODO Manage "More feature"
        /*if (features.length === 0 || features.length < threshold ) {
          console.log('No more data to download at this resolution');
        }*/
        vectorSource.addFeatures(features);
      } else {
        onError();
      }
    };
    xhr.send();
  }

  private buildUrl(extent, proj: olProjection, ogcFilters: OgcFiltersOptions): string {
    const paramsWFS = this.options.paramsWFS;
    const queryStringValues = formatWFSQueryString(this.options, undefined, this.options.paramsWFS.srsName);
    let igoFilters;
    if (ogcFilters && ogcFilters.enabled) {
      igoFilters = ogcFilters.filters;
    }
    const ogcFilterWriter = new OgcFilterWriter();
    const filterOrBox = ogcFilterWriter.buildFilter(igoFilters, extent, proj, ogcFilters.geometryName, this.options);
    let filterOrPush = ogcFilterWriter.handleOgcFiltersAppliedValue(this.options, ogcFilters.geometryName, extent, proj);

    let prefix = 'filter';
    if (!filterOrPush) {
      prefix = 'bbox';
      filterOrPush = extent.join(',') + ',' + proj.getCode();
    }

    paramsWFS.xmlFilter = ogcFilters.advancedOgcFilters ? filterOrBox : `${prefix}=${filterOrPush}`;
    let baseUrl = queryStringValues.find(f => f.name === 'getfeature').value;
    const patternFilter = /(filter|bbox)=.*/gi;
    baseUrl = patternFilter.test(paramsWFS.xmlFilter) ? `${baseUrl}&${paramsWFS.xmlFilter}` : baseUrl;
    this.options.download = Object.assign({}, this.options.download, { dynamicUrl: baseUrl });
    return baseUrl.replace(/&&/g, '&');
  }

  public onUnwatch() { }
}
