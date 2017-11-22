import { Md5 } from 'ts-md5/dist/md5';

import { QueryFormat, QueryOptions } from '../../../query';

import { DataSource } from './datasource';
import { DataSourceLegendOptions, FilterableDataSource,
         QueryableDataSource } from './datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';

export class WMSDataSource
  extends DataSource implements QueryableDataSource, FilterableDataSource {

  public options: WMSDataSourceOptions;
  public ol: ol.source.ImageWMS;

  private queryInfoFormat: string;

  get params(): any {
    return this.options.params as any;
  }

  get queryFormat(): QueryFormat {
    return this.options.queryFormat ? this.options.queryFormat : QueryFormat.GML2;
  }

  get queryTitle(): string {
    return this.options.queryTitle ? this.options.queryTitle : 'title';
  }

  get queryHtmlTarget(): string {
    return this.options.queryHtmlTarget ? this.options.queryHtmlTarget : 'newtab';
  }
  constructor(options: WMSDataSourceOptions) {
    // Important: To use wms versions smaller than 1.3.0, SRS
    // needs to be supplied in the source "params"

    // We need to do this to override the default version
    // of openlayers which is uppercase
    const sourceParams: any = options.params;
    if (sourceParams && sourceParams.version) {
      sourceParams.VERSION = sourceParams.version;
    }

    super(options);

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
      options.coordinates, options.resolution, options.projection, {
        'INFO_FORMAT': this.queryInfoFormat,
        'QUERY_LAYERS': this.params.layers,
        'FEATURE_COUNT': this.params.feature_count || '5'
      });

    return url;
  }

  reformatDateTime(value) {

    const year = value.getFullYear();
    let month = value.getMonth() + 1;
    let day = value.getUTCDate();
    let hour = value.getUTCHours();

    if ( Number(month) < 10 ) {
       month = '0' + month;
    }

    if ( Number(day) < 10) {
       day = '0' + day;
    }

    if ( Number(hour) < 10) {
       hour = '0' + hour;
    }

    return year + '-' + month + '-' + day + 'T' + hour + ':00:00Z';

   }

 filterByDate(date: Date | [Date, Date]) {
    let time = null;
    let newdateform = null;
    let newdateform_start = null;
    let newdateform_end = null;

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
         time = newdateform_start + '/' +  newdateform_end ;
      }
      if (newdateform_start === newdateform_end) {
         time = newdateform_start;
       }

    } else if (date) {
      newdateform = this.reformatDateTime(date);
      time = newdateform;
    }

    const params = {time: time};
    this.ol.updateParams(params);
  }
}
