import olSourceImageWMS from 'ol/source/ImageWMS';

import { DataSource } from './datasource';
import { DataSourceLegendOptions } from './datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import { WFSService } from './wfs.service';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import { OgcFilterableDataSourceOptions } from '../../../filter/shared/ogc-filter.interface';
import { QueryHtmlTarget } from '../../../query/shared/query.enums';
import { formatWFSQueryString, defaultWfsVersion, checkWfsParams, defaultFieldNameGeometry } from './wms-wfs.utils';

export class WMSDataSource extends DataSource {
  public ol: olSourceImageWMS;

  get params(): any {
    return this.options.params as any;
  }

  get queryTitle(): string {
    return (this.options as any).queryTitle
      ? (this.options as any).queryTitle
      : 'title';
  }

  get queryHtmlTarget(): string {
    return (this.options as any).queryHtmlTarget
      ? (this.options as any).queryHtmlTarget
      : QueryHtmlTarget.BLANK;
  }

  constructor(
    public options: WMSDataSourceOptions,
    protected wfsService: WFSService
  ) {
    super(options);
    // Important: To use wms versions smaller than 1.3.0, SRS
    // needs to be supplied in the source "params"

    // We need to do this to override the default version
    // of openlayers which is uppercase
    const sourceParams: any = options.params;
    if (sourceParams && sourceParams.version) {
      sourceParams.VERSION = sourceParams.version;
    }

    if (sourceParams && sourceParams.VERSION) {
      if (sourceParams.version !== '1.3.0') {
        if (!sourceParams.SRS && !sourceParams.srs) {
          throw new Error(`You must set a SRS (or srs) param for your WMS
           (layer =  ` + sourceParams.layers + `) because your want to use a WMS version under 1.3.0
        Ex: "srs": "EPSG:3857" `);
        }
      }
    }

    if (sourceParams && sourceParams.INFO_FORMAT) {
      sourceParams.info_format = sourceParams.INFO_FORMAT;
    }

    if (options.refreshIntervalSec && options.refreshIntervalSec > 0) {
      setInterval(() => {
        this.refresh();
      }, options.refreshIntervalSec * 1000); // Convert seconds to MS
    }

    let fieldNameGeometry = defaultFieldNameGeometry;

    // ####   START if paramsWFS
    if (options.paramsWFS) {
      const wfsCheckup = checkWfsParams(options);
      options.paramsWFS.version = wfsCheckup.paramsWFS.version;
      options.paramsWFS.wfsCapabilities = wfsCheckup.params.wfsCapabilities;

      if (options.paramsWFS.fieldNameGeometry) {
        fieldNameGeometry = options.paramsWFS.fieldNameGeometry;
      }

      this.wfsService.getSourceFieldsFromWFS(options);

      this.options.download = Object.assign({}, this.options.download, {
        dynamicUrl: this.buildDynamicDownloadUrlFromParamsWFS(this.options)
      });
    } //  ####   END  if paramsWFS
    if (!options.sourceFields || options.sourceFields.length === 0) {
      options.sourceFields = [];
    }
    const initOgcFilters = (this.options as OgcFilterableDataSourceOptions).ogcFilters;
    if (sourceParams.layers.split(',').length > 1 && this.options && initOgcFilters && initOgcFilters.enabled) {
      console.log('*******************************');
      console.log('BE CAREFULL, YOUR WMS LAYERS (' + sourceParams.layers
      + ') MUST SHARE THE SAME FIELDS TO ALLOW ogcFilters TO WORK !! ');
      console.log('*******************************');
  }

    if (this.options && initOgcFilters && initOgcFilters.enabled && initOgcFilters.filters) {
      initOgcFilters.geometryName = initOgcFilters.geometryName || fieldNameGeometry;
      const igoFilters = initOgcFilters.filters;
      const rebuildFilter = new OgcFilterWriter().buildFilter(igoFilters);
      const appliedFilter = this.formatProcessedOgcFilter(rebuildFilter, sourceParams.layers);
      const wmsFilterValue = appliedFilter.length > 0
        ? appliedFilter.replace('filter=', '')
        : undefined;
      this.ol.updateParams({ filter: wmsFilterValue });
    }

  }

  refresh() {
    this.ol.updateParams({ igoRefresh: Math.random() });
  }

  public formatProcessedOgcFilter(processedFilter, layers): string {
    let appliedFilter = '';
    if (processedFilter.length === 0 && layers.indexOf(',') === -1) {
      appliedFilter = processedFilter;
    } else {
      layers.split(',').forEach(layerName => {
        appliedFilter = `${appliedFilter}(${processedFilter.replace('filter=', '')})`;
      });
    }
    return `filter=${appliedFilter}`;
  }

  private buildDynamicDownloadUrlFromParamsWFS(asWFSDataSourceOptions) {
    const queryStringValues = formatWFSQueryString(asWFSDataSourceOptions);
    const downloadUrl = queryStringValues.find(f => f.name === 'getfeature').value;
    return downloadUrl;
  }

  protected createOlSource(): olSourceImageWMS {
    if (this.options.paramsWFS) {
      this.options.urlWfs = this.options.urlWfs || this.options.url;
      this.options.paramsWFS.version = this.options.paramsWFS.version || defaultWfsVersion;
    }
    let initOgcFilters = (this.options as OgcFilterableDataSourceOptions).ogcFilters;
    const ogcFiltersDefaultValue = false; // default values for wms.
    initOgcFilters = initOgcFilters === undefined ? {} : initOgcFilters;
    initOgcFilters.enabled = initOgcFilters.enabled === undefined ? ogcFiltersDefaultValue : initOgcFilters.enabled;
    initOgcFilters.editable = initOgcFilters.editable === undefined ? ogcFiltersDefaultValue : initOgcFilters.editable;
    return new olSourceImageWMS(this.options);
  }

  getLegend(scale?: number): DataSourceLegendOptions[] {
    let legend = super.getLegend();
    if (legend.length > 0) {
      return legend;
    }

    const sourceParams = this.params;

    let layers = [];
    if (sourceParams.layers !== undefined) {
      layers = sourceParams.layers.split(',');
    }

    const baseUrl = this.options.url.replace(/\?$/, '');
    const params = [
      'REQUEST=GetLegendGraphic',
      'SERVICE=wms',
      'FORMAT=image/png',
      'SLD_VERSION=1.1.0',
      `VERSION=${sourceParams.version || '1.3.0'}`
    ];
    if (scale !== undefined) {
      params.push(`SCALE=${scale}`);
    }

    legend = layers.map((layer: string) => {
      return {
        url: `${baseUrl}?${params.join('&')}&LAYER=${layer}`,
        title: layers.length > 1 ? layer : undefined
      };
    });

    return legend;
  }
}
