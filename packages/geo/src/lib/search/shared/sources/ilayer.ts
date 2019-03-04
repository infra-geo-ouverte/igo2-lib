import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';

import { LAYER, AnyLayerOptions, LayerOptions } from '../../../layer';

import { SearchResult } from '../search.interfaces';
import { SearchSource, TextSearch } from './source';
import { SearchSourceOptions, TextSearchOptions } from './source.interfaces';
import { ILayerData, ILayerResponse } from './ilayer.interfaces';

/**
 * ILayer search source
 */
@Injectable()
export class ILayerSearchSource
    extends SearchSource implements TextSearch {

  static id = 'ilayer';
  static type = LAYER;

  get title(): string {
    return this.languageService.translate.instant(this.options.title);
  }

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options);
  }

  getId(): string {
    return ILayerSearchSource.id;
  }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'igo.geo.search.dataSources.name',
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/apis/layers/search'
    };
  }

  /**
   * Search a layer by name or keyword
   * @param term Layer name or keyword
   * @returns Observable of <SearchResult<LayerOptions>[]
   */
  search(
    term: string | undefined,
    options?: TextSearchOptions
  ): Observable<SearchResult<LayerOptions>[]> {
    const params = this.computeSearchRequestParams(term, options || {});
    return this.http
      .get(this.searchUrl, { params })
      .pipe(
        map((response: ILayerResponse) => this.extractResults(response))
      );
  }

  private computeSearchRequestParams(term: string, options: TextSearchOptions): HttpParams {
    return new HttpParams({
      fromObject: Object.assign({
        q: term
      }, this.params, options.params || {})
    });
  }

  private extractResults(response: ILayerResponse): SearchResult<LayerOptions>[] {
    return response.items.map((data: ILayerData) => this.dataToResult(data));
  }

  private dataToResult(data: ILayerData): SearchResult<LayerOptions> {
    const layerOptions = this.computeLayerOptions(data);

    return {
      source: this,
      meta: {
        dataType: LAYER,
        id: [this.getId(), data.id].join('.'),
        title: data.source.title,
        titleHtml: data.highlight.title,
        icon: data.source.type === 'Layer' ? 'layers' : 'map'
      },
      data: layerOptions
    };
  }

  private computeLayerOptions(data: ILayerData): AnyLayerOptions {
    return {
      title: data.source.title,
      sourceOptions: {
        type: data.source.format,
        url: data.source.url,
        params: {
          layers: data.source.name
        }
      }
    };
  }
}
