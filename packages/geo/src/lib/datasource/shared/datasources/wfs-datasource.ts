import olSourceVector from 'ol/source/Vector';
import * as OlLoadingStrategy from 'ol/loadingstrategy';
import * as OlFormat from 'ol/format';

import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WFSService } from './wfs.service';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import { OgcFilterableDataSourceOptions } from '../../../filter/shared/ogc-filter.interface';
import { formatWFSQueryString, defaultWfsVersion, defaultFieldNameGeometry, defaultMaxFeatures, gmlRegex, jsonRegex, checkWfsParams} from './wms-wfs.utils';

export class WFSDataSource extends DataSource {
  public ol: olSourceVector;

  constructor(
    public options: WFSDataSourceOptions,
    protected wfsService: WFSService
  ) {
    super(options);
    this.options = checkWfsParams(options);
    this.wfsService.getSourceFieldsFromWFS(this.options);
  }

  protected createOlSource(): olSourceVector {
    const ogcFiltersDefaultValue = true; // default values for wfs.
    let ogcFilters  = (this.options as OgcFilterableDataSourceOptions).ogcFilters;
    // reassignation of params to paramsWFS and url to urlWFS to have a common interface with wms-wfs datasources
    this.options.paramsWFS = this.options.params;
    const paramsWFS = this.options.paramsWFS;
    this.options.urlWfs = this.options.url;
    paramsWFS.version = paramsWFS.version || defaultWfsVersion;
    paramsWFS.fieldNameGeometry = paramsWFS.fieldNameGeometry || defaultFieldNameGeometry;
    paramsWFS.maxFeatures = paramsWFS.maxFeatures || defaultMaxFeatures;

    ogcFilters = ogcFilters || {} ;
    ogcFilters.advancedOgcFilters = true;
    ogcFilters.enabled = ogcFilters.enabled || ogcFiltersDefaultValue;
    ogcFilters.editable =   ogcFilters.editable || ogcFiltersDefaultValue;
    ogcFilters.geometryName = paramsWFS.fieldNameGeometry || defaultFieldNameGeometry;

    if (ogcFilters.enabled && ogcFilters.pushButtons) {
      ogcFilters.advancedOgcFilters = false;
    }

    const queryStringValuesDownload = formatWFSQueryString(this.options);
    const downloadBaseUrl = queryStringValuesDownload.find(f => f.name === 'getfeature').value;
    this.options.download = Object.assign({}, this.options.download, { dynamicUrl: downloadBaseUrl });

    return new olSourceVector({
      format: this.getFormatFromOptions(),
      overlaps: false,
      url: (extent, resolution, proj) => {
        const queryStringValues = formatWFSQueryString(this.options, undefined, proj.getCode());
        let igoFilters;
        const ogcfilters = (this.options as OgcFilterableDataSourceOptions).ogcFilters;
        if (ogcfilters && ogcfilters.enabled) {
          igoFilters = ogcFilters.filters;
        }
        paramsWFS.xmlFilter = new OgcFilterWriter().buildFilter(igoFilters, extent, proj, ogcFilters.geometryName);
        let baseUrl = queryStringValues.find(f => f.name === 'getfeature').value;
        const patternFilter = /(filter|bbox)=.*/gi;
        baseUrl = patternFilter.test(paramsWFS.xmlFilter) ? `${baseUrl}&${paramsWFS.xmlFilter}` : baseUrl;
        this.options.download = Object.assign({}, this.options.download, { dynamicUrl: baseUrl });
        return baseUrl.replace(/&&/g, '&');
      },
      strategy: OlLoadingStrategy.bbox
    });
  }

  private getFormatFromOptions() {
    let olFormatCls;

    let outputFormat;
    if (this.options.paramsWFS.outputFormat) {
      outputFormat = this.options.paramsWFS.outputFormat.toLowerCase();
    }

    if (jsonRegex.test(outputFormat)) {
      olFormatCls = OlFormat.GeoJSON;
    }
    if (gmlRegex.test(outputFormat) || !outputFormat) {
      olFormatCls = OlFormat.WFS;
    }

    return new olFormatCls();
  }
}
