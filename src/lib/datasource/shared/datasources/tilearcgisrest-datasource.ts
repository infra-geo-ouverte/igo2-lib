import * as ol from 'openlayers';

import { QueryableDataSource } from './datasource.interface';
import { QueryFormat, QueryOptions } from '../../../query';

import { uuid } from '../../../utils';
import { DataSource } from './datasource';
import { DataSourceLegendOptions } from './datasource.interface';
import { TileArcGISRestDataSourceOptions } from './tilearcgisrest-datasource.interface';
import { ArcGISRestDataSourceService } from './arcgisrest-datasource.service';

export class TileArcGISRestDataSource extends DataSource
  implements QueryableDataSource {
  public ol: ol.source.TileArcGISRest;

  private legendInfo: any;

  get params(): any {
    return this.options.params as any;
  }

  get queryFormat(): QueryFormat {
    return this.options.queryFormat
      ? this.options.queryFormat
      : QueryFormat.ESRIJSON;
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
    public options: TileArcGISRestDataSourceOptions,
    protected dataSourceService: ArcGISRestDataSourceService
  ) {
    super(options, dataSourceService);

    const legendUrl = this.options.url + '/legend?f=json';
    this.dataSourceService
      .getDataFromUrl(legendUrl)
      .subscribe(res => (this.legendInfo = res));

    this.options.metadata = this.options.metadata
      ? this.options.metadata
      : {
          url: this.options.url,
          extern: true
        };
  }

  protected createOlSource(): ol.source.TileArcGISRest {
    return new ol.source.TileArcGISRest(this.options);
  }

  protected generateId() {
    return uuid();
  }

  getQueryUrl(options: QueryOptions): string {
    let extent = ol.extent.boundingExtent([options.coordinates]);
    if (this.options.queryPrecision) {
      extent = ol.extent.buffer(extent, this.options.queryPrecision);
    }
    const id = this.options.params.layers
      ? this.options.params.layers.substr(-1, 1)
      : '0';
    const baseUrl = this.options.url + '/' + id + '/query/';
    const geometry = encodeURIComponent(
      '{"xmin":' +
        extent[0] +
        ',"ymin":' +
        extent[1] +
        ',"xmax":' +
        extent[2] +
        ',"ymax":' +
        extent[3] +
        ',"spatialReference":{"wkid":102100}}'
    );
    const params = [
      'f=json',
      'returnGeometry=true',
      'spatialRel=esriSpatialRelIntersects',
      `geometry=${geometry}`,
      'geometryType=esriGeometryEnvelope',
      'inSR=102100',
      'outFields=*',
      'outSR=102100'
    ];
    return `${baseUrl}?${params.join('&')}`;
  }

  getLegend(): DataSourceLegendOptions[] {
    const params = this.options.params.layers ? this.options.params.layers : '';
    let htmlString = '<table>';

    for (let i = 0; i < this.legendInfo.layers.length; i++) {
      const lyr = this.legendInfo.layers[i];
      if (
        (params.includes('show') && !params.includes(lyr.layerId)) ||
        (params.includes('hide') && params.includes(lyr.layerId)) ||
        (params.includes('exclude') && params.includes(lyr.layerId))
      ) {
      } else {
        htmlString += '<tr><td>' + lyr.layerName + '</td></tr>';

        for (let j = 0; j < lyr.legend.length; j++) {
          const src = `${this.options.url}/${lyr.layerId}/images/${
            lyr.legend[j].url
          }`;
          const label = lyr.legend[j].label.replace('<Null>', 'Null');
          htmlString +=
            "<tr><td align='left'><img src=\"" +
            src +
            "\" alt ='' /></td><td>" +
            label +
            '</td></tr>';
        }
      }
    }
    htmlString += '</table>';
    return [{ html: htmlString }];
  }
}
