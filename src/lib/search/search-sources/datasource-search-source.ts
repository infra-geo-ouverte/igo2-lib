import { Injectable } from '@angular/core';
import { Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ConfigService, Message } from '../../core';
import { AuthHttp } from '../../auth';
import { Feature, FeatureType } from '../../feature';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';


@Injectable()
export class DataSourceSearchSource extends SearchSource {

  get enabled(): boolean { return this.options.enabled !== false; }
  set enabled(value: boolean) { this.options.enabled = value; }

  static _name: string = 'Data Sources';

  private searchUrl: string = 'https://geoegl.msp.gouv.qc.ca/igo2/api/layers/search';
  private options: SearchSourceOptions;

  constructor(private authHttp: AuthHttp,
              private config: ConfigService) {
    super();

    this.options = this.config.getConfig('searchSources.datasource') || {};
    this.searchUrl = this.options.url || this.searchUrl;
  }

  getName(): string {
    return DataSourceSearchSource._name;
  }

  search(term?: string): Observable<Feature[] | Message[]>  {
    const search = this.getSearchParams(term);

    return this.authHttp
      .get(this.searchUrl, { search })
      .map(res => this.extractData(res));
  }

  private extractData(response: Response): Feature[] {
    return response.json().items.map(this.formatResult);
  }

  private getSearchParams(term: string): URLSearchParams {
    const search = new URLSearchParams();
    const limit = this.options.limit === undefined ? 5 : this.options.limit;

    search.set('q', term);
    search.set('limit', String(limit));
    // search.set('callback', 'JSONP_CALLBACK');

    return search;
  }

  private formatResult(result: any): Feature {
    return {
      id: result.id,
      source: DataSourceSearchSource._name,
      type: FeatureType.DataSource,
      title: result.source.title,
      title_html: result.highlight.title,
      icon: result.source.type === 'Layer' ? 'layers' : 'map',
      properties: Object.assign({}, result.source, {
        type: result.source.format,
        params: {
          layers: result.source.name
        }
      })
    };
  }

}
