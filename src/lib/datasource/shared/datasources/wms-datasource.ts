import * as ol from 'openlayers';
import { Md5 } from 'ts-md5/dist/md5';

import { QueryFormat, QueryOptions } from '../../../query';

import { DataSource } from './datasource';
import {
  DataSourceLegendOptions,
  TimeFilterableDataSource,
  QueryableDataSource,
  OgcFilterableDataSource
} from './datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import {
  OgcFilterWriter,
  IgoOgcFilterObject,
  OgcFiltersOptions
} from '../../../filter/shared';
import { WFSDataSourceService } from './wfs-datasource.service';

export class WMSDataSource extends DataSource
  implements
    QueryableDataSource,
    TimeFilterableDataSource,
    OgcFilterableDataSource {
  // public options: WMSDataSourceOptions;
  public ol: ol.source.ImageWMS;
  public ogcFilterWriter: OgcFilterWriter;

  private queryInfoFormat: string;

  get params(): any {
    return this.options.params as any;
  }

  get queryFormat(): QueryFormat {
    return this.options.queryFormat
      ? this.options.queryFormat
      : QueryFormat.GML2;
  }

  get queryTitle(): string {
    return this.options.queryTitle ? this.options.queryTitle : 'title';
  }

  get queryHtmlTarget(): string {
    return this.options.queryHtmlTarget
      ? this.options.queryHtmlTarget
      : 'newtab';
  }

  constructor(
    public options: WMSDataSourceOptions,
    protected dataSourceService: WFSDataSourceService
  ) {
    super(options, dataSourceService);

    // Important: To use wms versions smaller than 1.3.0, SRS
    // needs to be supplied in the source "params"

    // We need to do this to override the default version
    // of openlayers which is uppercase
    const sourceParams: any = options.params;
    if (sourceParams && sourceParams.version) {
      sourceParams.VERSION = sourceParams.version;
    }

    if (options['sourceFields'] === undefined ||
    Object.keys(options['sourceFields']).length === 0) {
      options['sourceFields'] = [{ name: '', alias: '' }];
    }
    // WMS With linked wfs
    if (options.wfsSource && Object.keys(options.wfsSource).length > 0) {
      options.wfsSource = this.dataSourceService.checkWfsOptions(
        options.wfsSource
      );
      delete options.wfsSource.ogcFilters;
      options['fieldNameGeometry'] = options.wfsSource['fieldNameGeometry'];
      if (
        options['sourceFields'].length === 1 &&
        options['sourceFields'][0].name === ''
      ) {
        options['sourceFields'] = [];
        this.dataSourceService
          .wfsGetCapabilities(options)
          .map(
            wfsCapabilities =>
              (options.wfsSource['wfsCapabilities'] = {
                xml: wfsCapabilities.body,
                GetPropertyValue: /GetPropertyValue/gi.test(
                  wfsCapabilities.body
                )
                  ? true
                  : false
              })
          )
          .subscribe(
            val =>
              (options[
                'sourceFields'
              ] = this.dataSourceService.defineFieldAndValuefromWFS(
                options.wfsSource
              ))
          );
      } else {
        options['sourceFields']
          .filter(
            field => field.values === undefined || field.values.length === 0
          )
          .forEach(f => {
            f.values = this.dataSourceService.getValueFromWfsGetPropertyValues(
              options.wfsSource,
              f.name,
              200,
              0,
              0
            );
          });
      }

      const outputFormat =
        options.wfsSource.outputFormat !== undefined
          ? 'outputFormat=' + options.wfsSource.outputFormat
          : '';

      let paramMaxFeatures = 'maxFeatures';
      if (options.wfsSource.version === '2.0.0' || !options.wfsSource.version) {
        paramMaxFeatures = 'count';
      }
      const maxFeatures = options.wfsSource.maxFeatures
        ? paramMaxFeatures + '=' + options.wfsSource.maxFeatures
        : paramMaxFeatures + '=5000';
      const srsname = options.wfsSource.srsname
        ? 'srsname=' + options.wfsSource.srsname
        : 'srsname=EPSG:3857';
      const baseWfsQuery = this.dataSourceService.buildBaseWfsUrl(
        options.wfsSource,
        'GetFeature'
      );
      this.options.download = Object.assign({}, this.options.download, {
        dynamicUrl: `${baseWfsQuery}&${outputFormat}&${srsname}&${maxFeatures}`
      });
    }

    // WMS with filter AND fiterable by OGC
    options.isOgcFilterable =
      options.isOgcFilterable === undefined ? false : options.isOgcFilterable;
    options.ogcFilters =
      options.ogcFilters === undefined
        ? ({
            filtersAreEditable: true,
            filters: undefined
          } as OgcFiltersOptions)
        : options.ogcFilters;

    if (options.isOgcFilterable) {
      this.ogcFilterWriter = new OgcFilterWriter();
      if (options.ogcFilters && options.ogcFilters.filters) {
        options.ogcFilters.filters = this.ogcFilterWriter.checkIgoFiltersProperties(
          options.ogcFilters.filters,
          options['fieldNameGeometry'],
          true
        );
        options.ogcFilters.interfaceOgcFilters = this.ogcFilterWriter.defineInterfaceFilterSequence(
          // With some wms server, this param must be set to make spatials call.
          options.ogcFilters.filters,
          options['fieldNameGeometry']
        );
        this.filterByOgc(
          this.ogcFilterWriter.buildFilter(options.ogcFilters
            .filters as IgoOgcFilterObject)
        );
        options['ogcFiltered'] = true;
      } else {
        options.ogcFilters.filters = undefined;
        options.ogcFilters.interfaceOgcFilters = [];
        options['ogcFiltered'] = false;
      }
    }

    let queryInfoFormat;
    switch (this.queryFormat) {
      case QueryFormat.GML2:
        queryInfoFormat = 'application/vnd.ogc.gml';
        break;
      case QueryFormat.GML3:
        queryInfoFormat = 'application/vnd.ogc.gml/3.1.1';
        break;
      case QueryFormat.JSON:
        queryInfoFormat = 'application/json';
        break;
      case QueryFormat.GEOJSON:
        queryInfoFormat = 'application/geojson';
        break;
      case QueryFormat.TEXT:
        queryInfoFormat = 'text/plain';
        break;
      case QueryFormat.HTML:
        queryInfoFormat = 'text/html';
        break;
      default:
        break;
    }

    this.queryInfoFormat = queryInfoFormat;
  }

  protected createOlSource(): ol.source.ImageWMS {
    return new ol.source.ImageWMS(this.options);
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

  getQueryUrl(options: QueryOptions): string {
    const url = this.ol.getGetFeatureInfoUrl(
      options.coordinates,
      options.resolution,
      options.projection,
      {
        INFO_FORMAT: this.queryInfoFormat,
        QUERY_LAYERS: this.params.layers,
        FEATURE_COUNT: this.params.feature_count || '5'
      }
    );

    return url;
  }

  reformatDateTime(value) {
    const year = value.getFullYear();
    let month = value.getMonth() + 1;
    let day = value.getUTCDate();
    let hour = value.getUTCHours();

    if (Number(month) < 10) {
      month = '0' + month;
    }

    if (Number(day) < 10) {
      day = '0' + day;
    }

    if (Number(hour) < 10) {
      hour = '0' + hour;
    }

    return year + '-' + month + '-' + day + 'T' + hour + ':00:00Z';
  }

  filterByDate(date: Date | [Date, Date]) {
    let time;
    let newdateform;
    let newdateform_start;
    let newdateform_end;

    if (Array.isArray(date)) {
      const dates = [];
      if (date[0]) {
        newdateform_start = this.reformatDateTime(date[0]);
        dates.push(date[0]);
      }
      if (date[1]) {
        newdateform_end = this.reformatDateTime(date[1]);
        dates.push(date[1]);
      }
      if (dates.length === 2 && newdateform_start !== newdateform_end) {
        time = newdateform_start + '/' + newdateform_end;
      }
      if (newdateform_start === newdateform_end) {
        time = newdateform_start;
      }
    } else if (date) {
      newdateform = this.reformatDateTime(date);
      time = newdateform;
    }

    const params = { time: time };
    this.ol.updateParams(params);
  }

  filterByYear(year: string | [string, string]) {
    let time;
    let newdateform_start;
    let newdateform_end;

    if (Array.isArray(year)) {
      const years = [];
      if (year[0]) {
        newdateform_start = year[0];
        years.push(year[0]);
      }
      if (year[1]) {
        newdateform_end = year[1];
        years.push(year[1]);
      }
      if (years.length === 2 && newdateform_start !== newdateform_end) {
        time = newdateform_start + '/' + newdateform_end;
      }
      if (newdateform_start === newdateform_end) {
        time = newdateform_start;
      }
    } else if (year) {
      time = year;
    }

    const params = { time: time };
    this.ol.updateParams(params);
  }

  public filterByOgc(filterString: string) {
    const wmsFilterValue =
      filterString.length > 0
        ? filterString.substr(7, filterString.length + 1)
        : undefined;
    this.ol.updateParams({ filter: wmsFilterValue });
  }
}
