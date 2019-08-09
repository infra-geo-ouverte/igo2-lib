import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';

import { LAYER, AnyLayerOptions, LayerOptions } from '../../../layer';
import { QueryableDataSourceOptions, QueryFormat } from '../../../query';

import { SearchResult } from '../search.interfaces';
import { SearchSource, TextSearch } from './source';
import { TextSearchOptions } from './source.interfaces';
import { ILayerSearchSourceOptions, ILayerData, ILayerResponse } from './ilayer.interfaces';

/**
 * ILayer search source
 */
@Injectable()
export class ILayerSearchSource extends SearchSource implements TextSearch {

  static id = 'ilayer';
  static type = LAYER;

  title$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get title(): string {
    return this.title$.getValue();
  }

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    @Inject('options') options: ILayerSearchSourceOptions
  ) {
    super(options);
    this.languageService.translate.get(this.options.title).subscribe(title => this.title$.next(title));
  }

  getId(): string {
    return ILayerSearchSource.id;
  }

  protected getDefaultOptions(): ILayerSearchSourceOptions {
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
    const url = data.source.url;
    const queryParams: any = this.extractQueryParamsFromSourceUrl(url);
    return {
      title: data.source.title,
      sourceOptions: {
        crossOrigin: 'anonymous',
        type: data.source.format,
        url,
        queryable: (data.source as QueryableDataSourceOptions).queryable,
        queryFormat: queryParams.format,
        queryHtmlTarget: queryParams.htmlTarget,
        params: {
          layers: data.source.name
        }
      }
    };
  }

  private extractQueryParamsFromSourceUrl(url: string): {format: QueryFormat; htmlTarget: string; } {
    let queryFormat = QueryFormat.GML2;
    let htmlTarget;
    const formatOpt = (this.options as ILayerSearchSourceOptions).queryFormat;
    if (formatOpt) {
      for (const key of Object.keys(formatOpt)) {
        const value = formatOpt[key];
        if (value === '*') {
          queryFormat = QueryFormat[key.toUpperCase()];
          break;
        }

        const urls = (value as any as {urls: string[]}).urls;
        if (Array.isArray(urls)) {
          urls.forEach((urlOpt) => {
            if (url.indexOf(urlOpt) !== -1) {
              queryFormat = QueryFormat[key.toUpperCase()];
            }
          });
          break;
        }
      }
    }

    if (queryFormat === QueryFormat.HTML) {
      htmlTarget = 'iframe';
    }

    return {
      format: queryFormat,
      htmlTarget
    };
  }
}
