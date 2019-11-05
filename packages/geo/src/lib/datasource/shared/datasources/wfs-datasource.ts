import olSourceVector from 'ol/source/Vector';
import * as OlLoadingStrategy from 'ol/loadingstrategy';

import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WFSService } from './wfs.service';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import { OgcFilterableDataSourceOptions, OgcFiltersOptions } from '../../../filter/shared/ogc-filter.interface';
import {
  formatWFSQueryString,
  defaultFieldNameGeometry,
  gmlRegex,
  jsonRegex,
  checkWfsParams,
  getFormatFromOptions
} from './wms-wfs.utils';

export class WFSDataSource extends DataSource {
  public ol: olSourceVector;

  constructor(
    public options: WFSDataSourceOptions,
    protected wfsService: WFSService
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

    return new olSourceVector({
      format: getFormatFromOptions(this.options),
      overlaps: false,
      url: (extent, resolution, proj) => {
        return this.buildUrl(
          extent,
          proj,
          (this.options as OgcFilterableDataSourceOptions).ogcFilters);
      },
      strategy: OlLoadingStrategy.bbox
    });
  }

  private buildUrl(extent, proj, ogcFilters: OgcFiltersOptions): string {
    const paramsWFS = this.options.paramsWFS;
    const queryStringValues = formatWFSQueryString(this.options, undefined, proj.getCode());
    let igoFilters;
    if (ogcFilters && ogcFilters.enabled) {
      igoFilters = ogcFilters.filters;
    }
    const ogcFilterWriter = new OgcFilterWriter();
    const filterOrBox = ogcFilterWriter.buildFilter(igoFilters, extent, proj, ogcFilters.geometryName);
    let filterOrPush = ogcFilterWriter.handleOgcFiltersAppliedValue(this.options, ogcFilters.geometryName);

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

  public onUnwatch() {}
}
