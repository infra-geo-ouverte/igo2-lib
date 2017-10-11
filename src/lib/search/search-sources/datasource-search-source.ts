import { Injectable } from '@angular/core';
import { Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ConfigService, Message, LanguageService } from '../../core';
import { AuthHttp } from '../../auth';
import { Feature, FeatureType } from '../../feature';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';


@Injectable()
export class DataSourceSearchSource extends SearchSource {

  get enabled(): boolean { return this.options.enabled !== false; }
  set enabled(value: boolean) { this.options.enabled = value; }

  static _name: string = 'igo.search.dataSources.name';

  private searchUrl: string = 'https://geoegl.msp.gouv.qc.ca/igo2/api/layers/search';
  private options: SearchSourceOptions;

  constructor(private authHttp: AuthHttp,
              private config: ConfigService,
              private languageService: LanguageService) {
    super();

    this.options = this.config.getConfig('searchSources.datasource') || {};
    this.searchUrl = this.options.url || this.searchUrl;
  }

  getName(): string {
    return this.languageService.translate.instant(DataSourceSearchSource._name);
  }

  search(term?: string): Observable<Feature[] | Message[]>  {
    const search = this.getSearchParams(term);

    return this.authHttp
      .get(this.searchUrl, { search })
      .map(res => this.extractData(res));
  }

  private extractData(response: Response): Feature[] {
    return response.json().items.map(
      (res) => this.formatResult(res)
    );
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
    const t = this.languageService.translate;
    const properties = {};
    const prefix = 'igo.search.dataSources.properties.';
    properties[t.instant(prefix + 'title')] = result.source.title;
    properties[t.instant(prefix + 'group')] = result.source.groupTitle;
    properties[t.instant(prefix + 'abstract')] = result.source.abstract;
    properties[t.instant(prefix + 'type')] = result.source.format;
    properties[t.instant(prefix + 'url')] = result.source.url;

    const layer = Object.assign({}, result.source, {
      type: result.source.format,
      properties: properties,
      params: {
        layers: result.source.name
      }
    });

    return {
      id: result.id,
      source: this.getName(),
      type: FeatureType.DataSource,
      title: result.source.title,
      title_html: result.highlight.title,
      icon: result.source.type === 'Layer' ? 'layers' : 'map',
      properties: properties,
      layer: layer
    };
  }

}
