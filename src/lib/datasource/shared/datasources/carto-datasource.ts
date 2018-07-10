import * as ol from 'openlayers';

import { QueryableDataSource } from './datasource.interface';
import { QueryFormat, QueryOptions } from '../../../query';

import { uuid } from '../../../utils';
import { DataSource } from './datasource';
import { CartoDataSourceOptions } from './carto-datasource.interface';

export class CartoDataSource extends DataSource implements QueryableDataSource {
  public ol: ol.source.CartoDB;
  public options: CartoDataSourceOptions;

  get params(): any {
    return this.options.config as any;
  }

  get queryFormat(): QueryFormat {
    return this.options.queryFormat
      ? this.options.queryFormat
      : QueryFormat.GEOJSON;
  }

  get queryTitle(): string {
    return this.options.queryTitle ? this.options.queryTitle : 'title';
  }

  get queryHtmlTarget(): string {
    return this.options.queryHtmlTarget
      ? this.options.queryHtmlTarget
      : 'newtab';
  }

  protected createOlSource(): ol.source.CartoDB {
    return new ol.source.CartoDB(this.options);
  }

  getQueryUrl(options: QueryOptions): string {
    const baseUrl =
      'https://' + this.options.account + '.carto.com/api/v2/sql?';
    const format = 'format=GeoJSON';
    const sql = '&q=' + this.options.config.layers[0].options.sql;
    const clause =
      ' WHERE ST_Intersects(the_geom_webmercator,ST_BUFFER(ST_SetSRID(ST_POINT(';
    const metres = this.options.queryPrecision
      ? this.options.queryPrecision
      : '1000';
    const coordinates =
      options.coordinates[0] +
      ',' +
      options.coordinates[1] +
      '),3857),' +
      metres +
      '))';

    return `${baseUrl}${format}${sql}${clause}${coordinates}`;
  }

  protected generateId() {
    return uuid();
  }
}
