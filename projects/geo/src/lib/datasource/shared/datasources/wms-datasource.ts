import { Md5 } from 'ts-md5';
import olSourceImageWMS from 'ol/source/ImageWMS';

import { DataSource } from './datasource';
import { DataSourceLegendOptions } from './datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import { WFSService } from './wfs.service';
import { WFSDataSourceOptions } from './wfs-datasource.interface';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import { OgcFilterableDataSourceOptions } from '../../../filter/shared/ogc-filter.interface';

export class WMSDataSource extends DataSource {
  public ol: olSourceImageWMS;
  public ogcFilterWriter: OgcFilterWriter;

  private queryInfoFormat: string;

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
      : 'newtab';
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

    if (sourceParams && sourceParams.INFO_FORMAT) {
      sourceParams.info_format = sourceParams.INFO_FORMAT;
    }

    if (options.refreshIntervalSec && options.refreshIntervalSec > 0) {
      setInterval(() => {
        this.ol.updateParams({ igoRefresh: Math.random() });
      }, options.refreshIntervalSec * 1000); // Convert seconds to MS
    }

    // ####   START if paramsWFS
    if (options.paramsWFS) {
      const wfsCheckup = this.wfsService.checkWfsOptions(options);
      options.paramsWFS.version = wfsCheckup.paramsWFS.version;
      options.paramsWFS.wfsCapabilities = wfsCheckup.params.wfsCapabilities;

      this.wfsService.getSourceFieldsFromWFS(options);

      this.options.download = Object.assign({}, this.options.download, {
        dynamicUrl: this.buildDynamicDownloadUrlFromParamsWFS(this.options)
      });
    } //  ####   END  if paramsWFS
    this.ogcFilterWriter = new OgcFilterWriter();
    if (!options.sourceFields || options.sourceFields.length === 0) {
      options.sourceFields = [];
    }
  }

  private buildDynamicDownloadUrlFromParamsWFS(asWFSDataSourceOptions) {
    const outputFormat =
      asWFSDataSourceOptions.paramsWFS.outputFormat !== undefined
        ? 'outputFormat=' + asWFSDataSourceOptions.paramsWFS.outputFormat
        : '';

    let paramMaxFeatures = 'maxFeatures';
    if (
      asWFSDataSourceOptions.paramsWFS.version === '2.0.0' ||
      !asWFSDataSourceOptions.paramsWFS.version
    ) {
      paramMaxFeatures = 'count';
    }
    const maxFeatures = asWFSDataSourceOptions.paramsWFS.maxFeatures
      ? paramMaxFeatures + '=' + asWFSDataSourceOptions.paramsWFS.maxFeatures
      : paramMaxFeatures + '=5000';
    const srsname = asWFSDataSourceOptions.paramsWFS.srsname
      ? 'srsname=' + asWFSDataSourceOptions.paramsWFS.srsname
      : 'srsname=EPSG:3857';
    const baseWfsQuery = this.wfsService.buildBaseWfsUrl(
      asWFSDataSourceOptions,
      'GetFeature'
    );
    return `${baseWfsQuery}&${outputFormat}&${srsname}&${maxFeatures}`;
  }

  protected createOlSource(): olSourceImageWMS {
    if (this.options.paramsWFS) {
      this.options.urlWfs = this.options.urlWfs
        ? this.options.urlWfs
        : this.options.url;
      this.options.paramsWFS.version = this.options.paramsWFS.version
        ? this.options.paramsWFS.version
        : '2.0.0';
    }
    const ogcFiltersDefaultValue = false; // default values for wms.
    (this.options as OgcFilterableDataSourceOptions).ogcFilters =
      (this.options as OgcFilterableDataSourceOptions).ogcFilters === undefined
        ? {}
        : (this.options as OgcFilterableDataSourceOptions).ogcFilters;
    (this.options as OgcFilterableDataSourceOptions).ogcFilters.enabled =
      (this.options as OgcFilterableDataSourceOptions).ogcFilters.enabled ===
      undefined
        ? ogcFiltersDefaultValue
        : (this.options as OgcFilterableDataSourceOptions).ogcFilters.enabled;
    (this.options as OgcFilterableDataSourceOptions).ogcFilters.editable =
      (this.options as OgcFilterableDataSourceOptions).ogcFilters.editable ===
      undefined
        ? ogcFiltersDefaultValue
        : (this.options as OgcFilterableDataSourceOptions).ogcFilters.editable;
    return new olSourceImageWMS(this.options);
  }

  protected generateId() {
    const layers = this.params.layers;
    const chain = 'wms' + this.options.url + layers;

    return Md5.hashStr(chain) as string;
  }

  getLegend(): DataSourceLegendOptions[] {
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

    legend = layers.map((layer: string) => {
      return {
        url: `${baseUrl}?${params.join('&')}&LAYER=${layer}`,
        title: layers.length > 1 ? layer : undefined
      };
    });

    return legend;
  }
}
