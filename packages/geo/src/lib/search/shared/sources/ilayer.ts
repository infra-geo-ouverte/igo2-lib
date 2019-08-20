import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';

import { LAYER } from '../../../layer';
import { QueryableDataSourceOptions, QueryFormat } from '../../../query';
import { QueryHtmlTarget } from './../../../query/shared/query.enums';

import { SearchResult } from '../search.interfaces';
import { SearchSource, TextSearch } from './source';
import { TextSearchOptions } from './source.interfaces';
import { ILayerSearchSourceOptions, ILayerData, ILayerItemResponse, ILayerServiceResponse, ILayerDataSource } from './ilayer.interfaces';

@Injectable()
export class ILayerSearchResultFormatter {
  constructor(private languageService: LanguageService) {}

  formatResult(data: ILayerData): ILayerData {
    const allowedKey = ['title', 'abstract', 'groupTitle', 'metadataUrl'];

    const property = Object.entries(data.properties)
      .filter(([key]) => allowedKey.indexOf(key) !== -1)
      .reduce((out: {[key: string]: any}, entries: [string, any]) => {
        const [key, value] = entries;
        let newKey;
        try {
          newKey = this.languageService.translate.instant('igo.geo.search.ilayer.properties.' + key);
        } catch (e) {
          newKey = key;
        }
        out[newKey] = value ? value : '';
        return out;
      }, {});

    const dataR = Object.assign({}, data);
    dataR.properties = property as ILayerDataSource;

    return dataR;
  }
}

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
    @Inject('options') options: ILayerSearchSourceOptions,
    @Inject(ILayerSearchResultFormatter)
    private formatter: ILayerSearchResultFormatter
  ) {
    super(options);
    this.languageService.translate.get(this.options.title).subscribe(title => this.title$.next(title));
  }

  getId(): string {
    return ILayerSearchSource.id;
  }

  protected getDefaultOptions(): ILayerSearchSourceOptions {
    return {
      title: 'igo.geo.search.ilayer.name',
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
  ): Observable<SearchResult<ILayerItemResponse>[]> {
    const params = this.computeSearchRequestParams(term, options || {});
    return this.http
      .get(this.searchUrl, { params })
      .pipe(
        map((response: ILayerServiceResponse) => this.extractResults(response))
      );
  }

  private computeSearchRequestParams(term: string, options: TextSearchOptions): HttpParams {
    return new HttpParams({
      fromObject: Object.assign({
        q: term
      }, this.params, options.params || {})
    });
  }

  private extractResults(response: ILayerServiceResponse): SearchResult<ILayerItemResponse>[] {
    return response.items.map((data: ILayerData) => this.dataToResult(data));
  }

  private dataToResult(data: ILayerData): SearchResult<ILayerItemResponse> {
    const layerOptions = this.computeLayerOptions(data);

    return {
      source: this,
      meta: {
        dataType: LAYER,
        id: [this.getId(), data.properties.id].join('.'),
        title: data.properties.title,
        titleHtml: data.highlight.title,
        icon: data.properties.type === 'Layer' ? 'layers' : 'map'
      },
      data: layerOptions
    };
  }

  private computeLayerOptions(data: ILayerData): ILayerItemResponse {
    const url = data.properties.url;
    const queryParams: QueryableDataSourceOptions = this.extractQueryParamsFromSourceUrl(url);
    return {
      sourceOptions: {
        id: data.properties.id,
        crossOrigin: 'anonymous',
        type: data.properties.format,
        url,
        queryFormat: queryParams.queryFormat,
        queryHtmlTarget: queryParams.queryHtmlTarget,
        queryable: data.properties.queryable,
        params: {
          layers: data.properties.name
        }
      },
      title: data.properties.title,
      properties: this.formatter.formatResult(data).properties
    };
  }

  private extractQueryParamsFromSourceUrl(url: string): {queryFormat: QueryFormat; queryHtmlTarget: QueryHtmlTarget; } {
    let queryFormat = QueryFormat.GML2;
    let queryHtmlTarget;
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
      queryHtmlTarget = 'iframe';
    }

    return {
      queryFormat,
      queryHtmlTarget
    };
  }
}
