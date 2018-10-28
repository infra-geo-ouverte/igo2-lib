import olSourceVector from 'ol/source/Vector';
import * as olloadingstrategy from 'ol/loadingstrategy';
import * as olformat from 'ol/format';

import { uuid } from '@igo2/utils';

import { DataSource } from './datasource';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WFSService } from './wfs.service';

import { OgcFilterWriter } from '../../../filter/shared/ogc-filter';
import { OgcFilterableDataSourceOptions } from '../../../filter/shared/ogc-filter.interface';

export class WFSDataSource extends DataSource {
  public ol: olSourceVector;
  public ogcFilterWriter: OgcFilterWriter;

  constructor(
    public options: WFSDataSourceOptions,
    protected wfsService: WFSService
  ) {
    super(options);
    this.options = this.wfsService.checkWfsOptions(options);
    this.ogcFilterWriter = new OgcFilterWriter();
    this.wfsService.getSourceFieldsFromWFS(this.options);
  }

  protected generateId() {
    return uuid();
  }

  protected createOlSource(): olSourceVector {
    // reassignation of params to paramsWFS and url to urlWFS to have a common interface with wms-wfs datasources
    this.options.paramsWFS = this.options.params;
    this.options.urlWfs = this.options.url;
    // default wfs version
    this.options.paramsWFS.version = this.options.paramsWFS.version
      ? this.options.paramsWFS.version
      : '2.0.0';
    const ogcFiltersDefaultValue = true; // default values for wfs.
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

    const baseWfsQuery = 'service=WFS&request=GetFeature';
    // Mandatory
    const url = this.options.urlWfs;
    // Optional
    const outputFormat = this.options.paramsWFS.outputFormat
      ? 'outputFormat=' + this.options.paramsWFS.outputFormat
      : '';
    const wfsVersion = this.options.paramsWFS.version
      ? 'version=' + this.options.paramsWFS.version
      : 'version=' + '2.0.0';

    let paramTypename = 'typename';
    let paramMaxFeatures = 'maxFeatures';
    if (
      this.options.paramsWFS.version === '2.0.0' ||
      !this.options.paramsWFS.version
    ) {
      paramTypename = 'typenames';
      paramMaxFeatures = 'count';
    }

    const featureTypes =
      paramTypename + '=' + this.options.paramsWFS.featureTypes;

    const maxFeatures = this.options.paramsWFS.maxFeatures
      ? paramMaxFeatures + '=' + this.options.paramsWFS.maxFeatures
      : paramMaxFeatures + '=5000';

    let downloadBaseUrl = `${url}?${baseWfsQuery}&${wfsVersion}&${featureTypes}&`;
    downloadBaseUrl += `${outputFormat}&${maxFeatures}`;

    this.options.download = Object.assign({}, this.options.download, {
      dynamicUrl: downloadBaseUrl
    });

    return new olSourceVector({
      format: this.getFormatFromOptions(),
      overlaps: false,
      url: (extent, resolution, proj) => {
          const srsname = this.options.paramsWFS.srsName
          ? 'srsname=' + this.options.paramsWFS.srsName
          : 'srsname=' + proj.getCode();

        let filters;
        if (
          (this.options as OgcFilterableDataSourceOptions).ogcFilters &&
          (this.options as OgcFilterableDataSourceOptions).ogcFilters.enabled
        ) {
          filters = (this.options as OgcFilterableDataSourceOptions).ogcFilters.filters;
        }
          this.options.paramsWFS.xmlFilter = this.ogcFilterWriter.buildFilter(
            filters,
            extent,
            proj,
            this.options.paramsWFS.fieldNameGeometry
          );

        let baseUrl = `${url}?${baseWfsQuery}&${wfsVersion}&${featureTypes}&`;
        baseUrl += `${outputFormat}&${srsname}&${maxFeatures}`;

        const patternFilter = /(filter|bbox)=.*/gi;
        if (patternFilter.test(this.options.paramsWFS.xmlFilter)) {
          baseUrl += `&${this.options.paramsWFS.xmlFilter}`;
        }

        this.options.download = Object.assign({}, this.options.download, {
          dynamicUrl: baseUrl
        });

        return baseUrl;
      },
      strategy: olloadingstrategy.bbox
    });
  }

  private getFormatFromOptions() {
    let olFormatCls;

    const outputFormat = this.options.paramsWFS.outputFormat.toLowerCase();
    const patternGml3 = new RegExp('.*?gml.*?');
    const patternGeojson = new RegExp('.*?json.*?');

    if (patternGeojson.test(outputFormat)) {
      olFormatCls = olformat.GeoJSON;
    }
    if (patternGml3.test(outputFormat)) {
      olFormatCls = olformat.WFS;
    }

    return new olFormatCls();
  }
}
