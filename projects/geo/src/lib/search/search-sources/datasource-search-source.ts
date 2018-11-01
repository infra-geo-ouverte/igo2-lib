import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService, LanguageService } from '@igo2/core';

import {
  FeatureType,
  SourceFeatureType
} from '../../feature/shared/feature.enum';
import { Feature } from '../../feature/shared/feature.interface';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';

@Injectable()
export class DataSourceSearchSource extends SearchSource {
  get enabled(): boolean {
    return this.options.enabled !== false;
  }
  set enabled(value: boolean) {
    this.options.enabled = value;
  }

  static _name = 'igo.geo.search.dataSources.name';

  private searchUrl = 'https://geoegl.msp.gouv.qc.ca/apis/layers/search';
  private options: SearchSourceOptions;

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private languageService: LanguageService
  ) {
    super();

    this.options = this.config.getConfig('searchSources.datasource') || {};
    this.searchUrl = this.options.searchUrl || this.searchUrl;
  }

  getName(): string {
    return this.languageService.translate.instant(DataSourceSearchSource._name);
  }

  search(term?: string): Observable<Feature[]> {
    const searchParams = this.getSearchParams(term);

    return this.http
      .get(this.searchUrl, { params: searchParams })
      .pipe(map(res => this.extractData(res)));
  }

  locate(coordinate?: [number, number]): Observable<Feature[]> {
    // It should be a good idea to locate layers by coordinates ?
    return;
  }

  private extractData(response): Feature[] {
    return response.items.map(res => this.formatResult(res));
  }

  private getSearchParams(term: string): HttpParams {
    const limit = this.options.limit === undefined ? 5 : this.options.limit;

    return new HttpParams({
      fromObject: {
        q: term,
        limit: String(limit)
      }
    });
  }

  private formatResult(result: any): Feature {
    const t = this.languageService.translate;
    const properties = {};
    const prefix = 'igo.geo.search.dataSources.properties.';
    properties[t.instant(prefix + 'title')] = result.source.title;
    properties[t.instant(prefix + 'group')] = result.source.groupTitle;
    properties[t.instant(prefix + 'abstract')] = result.source.abstract;
    properties[t.instant(prefix + 'type')] = result.source.format;
    properties[t.instant(prefix + 'url')] = result.source.url;

    const layer = {
      title: result.source.title,
      sourceOptions: {
        type: result.source.format,
        url: result.source.url,
        params: {
          layers: result.source.name
        }
      }
    };

    return {
      id: result.id,
      source: this.getName(),
      sourceType: SourceFeatureType.Search,
      order: 2,
      type: FeatureType.DataSource,
      title: result.source.title,
      title_html: result.highlight.title,
      icon: result.source.type === 'Layer' ? 'layers' : 'map',
      properties: properties,
      layer: layer
    };
  }
}
