import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';

import { LAYER, AnyLayerOptions, LayerOptions } from '../../../layer';
import { QueryableDataSourceOptions, QueryFormat, QueryableDataSource } from '../../../query';
import { QueryHtmlTarget } from './../../../query/shared/query.enums';

import { SearchResult } from '../search.interfaces';
import { SearchSource, TextSearch } from './source';
import { TextSearchOptions } from './source.interfaces';
import { ILayerSearchSourceOptions, ILayerData, ILayerResponse, ILayerDataSource } from './ilayer.interfaces';

@Injectable()
export class ILayerSearchResultFormatter {
  constructor(private languageService: LanguageService) {}

  formatResult(data: ILayerData): ILayerData {
    const property = Object.entries(data.properties).reduce((out: {[key: string]: any}, entries: [string, any]) => {
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

    data.properties = property as ILayerDataSource;

    return data;
  }
}

/**
 * ILayer search source
 */
@Injectable()
export class ILayerSearchSource extends SearchSource implements TextSearch {

  static id = 'ilayer';
  static type = LAYER;

  get title(): string {
    return this.languageService.translate.instant(this.options.title);
  }

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    @Inject('options') options: ILayerSearchSourceOptions,
    @Inject(ILayerSearchResultFormatter)
    private formatter: ILayerSearchResultFormatter
  ) {
    super(options);
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
        title: data.properties.title,
        titleHtml: data.highlight.title,
        icon: data.properties.type === 'Layer' ? 'layers' : 'map'
      },
      data: layerOptions
    };
  }

  private computeLayerOptions(data: ILayerData): AnyLayerOptions {
    const url = data.properties.url;
    const queryParams: QueryableDataSourceOptions = this.extractQueryParamsFromSourceUrl(url);
    const dataFormat: ILayerData = this.formatter.formatResult(data);
    return {
      sourceOptions: {
        crossOrigin: 'anonymous',
        type: dataFormat.properties.format,
        url,
        queryFormat: queryParams.queryFormat,
        queryHtmlTarget: queryParams.queryHtmlTarget,
        queryable: dataFormat.properties.queryable,
        params: {
          layers: dataFormat.properties.name
        }
      },
      title: dataFormat.properties.title,
      properties: dataFormat.properties
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
