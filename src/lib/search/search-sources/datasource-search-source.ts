import { Inject, Injectable } from '@angular/core';
import { Jsonp, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Message } from '../../core/message';
import { Feature, FeatureType } from '../../feature';

import { SearchSource } from './search-source';
import { SEARCH_SOURCE_OPTIONS } from './search-source.provider';
import { SearchSourceOptions } from './search-source.interface';


@Injectable()
export class DataSourceSearchSource extends SearchSource {

  static _name: string = 'Data Sources';
  static searchUrl: string = 'http://spssogl19d.sso.msp.gouv.qc.ca/igo2/api/layers/search';

  constructor(private jsonp: Jsonp,
              @Inject(SEARCH_SOURCE_OPTIONS)
              private options: SearchSourceOptions) {
    super();

    this.options = options ? options : {};
  }

  getName(): string {
    return DataSourceSearchSource._name;
  }

  search(term?: string): Observable<Feature[] | Message[]>  {
    const search = this.getSearchParams(term);

    return this.jsonp
      .get(DataSourceSearchSource.searchUrl, { search })
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
    search.set('callback', 'JSONP_CALLBACK');

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
