import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';

import { ObjectUtils } from '@igo2/utils';

import { FEATURE, Feature } from '../../../feature';

import { SearchResult } from '../search.interfaces';
import { SearchSource, TextSearch, ReverseSearch } from './source';
import {
  SearchSourceOptions,
  TextSearchOptions,
  ReverseSearchOptions
} from './source.interfaces';
import {
  IChercheData,
  IChercheResponse,
  IChercheReverseData,
  IChercheReverseResponse
} from './icherche.interfaces';

@Injectable()
export class IChercheSearchResultFormatter {
  constructor(private languageService: LanguageService) {}

  formatResult(result: SearchResult<Feature>): SearchResult<Feature> {
    return result;
  }
}

/**
 * ICherche search source
 */
@Injectable()
export class IChercheSearchSource extends SearchSource implements TextSearch {
  static id = 'icherche';
  static type = FEATURE;
  static propertiesBlacklist: string[] = [
    '@timestamp',
    '@version',
    'recherche',
    'id',
    'idrte',
    'cote',
    'geometry',
    'bbox'
  ];

  constructor(
    private http: HttpClient,
    @Inject('options') options: SearchSourceOptions,
    @Inject(IChercheSearchResultFormatter)
    private formatter: IChercheSearchResultFormatter
  ) {
    super(options);
  }

  getId(): string {
    return IChercheSearchSource.id;
  }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'ICherche Québec',
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/icherche/geocode',
      settings: [
        {
            type: 'checkbox',
            title: 'Type de résultat',
            name: 'type',
            values: [
              {
                title: 'Adresse',
                value: 'adresse',
                enabled: true
              },
              {
                title: 'Ancienne adresse',
                value: 'ancienne_adresse',
                enabled: true
              },
              {
                title: 'Code Postal',
                value: 'code_postal',
                enabled: true
              },
              {
                title: 'Route',
                value: 'route',
                enabled: true
              },
              {
                title: 'Municipalité',
                value: 'municipalite',
                enabled: true
              },
              {
                title: 'Ancienne municipalité',
                value: 'ancienne_municipalite',
                enabled: true
              },
              {
                title: 'mrc',
                value: 'mrc',
                enabled: true
              },
              {
                title: 'Région administrative',
                value: 'region_administrative',
                enabled: true
              }
            ]
        },
        {
          type: 'radiobutton',
          title: 'Maximum de résultat',
          name: 'limit',
          values: [
            {
              title: '1',
              value: 1,
              enabled: false
            },
            {
              title: '5',
              value: 5,
              enabled: true
            },
            {
              title: '10',
              value: 10,
              enabled: false
            }
          ]
        },
        {
          type: 'radiobutton',
          title: 'Niveau de confiance',
          name: 'ecmax',
          values: [
            {
              title: '1',
              value: 1,
              enabled: false
            },
            {
              title: '15',
              value: 15,
              enabled: true
            },
            {
              title: '50',
              value: 50,
              enabled: false
            },
            {
              title: '75',
              value: 75,
              enabled: false
            },
            {
              title: '100',
              value: 100,
              enabled: false
            }
          ]
        }
      ]
    };
  }

  /**
   * Search a location by name or keyword
   * @param term Location name or keyword
   * @returns Observable of <SearchResult<Feature>[]
   */
  search(
    term: string,
    options?: TextSearchOptions
  ): Observable<SearchResult<Feature>[]> {
    const params = this.computeRequestParams(term, options || {});
    return this.http
      .get(this.searchUrl, { params })
      .pipe(map((response: IChercheResponse) => this.extractResults(response)));
  }

  private computeRequestParams(term: string, options: TextSearchOptions): HttpParams {
    return new HttpParams({
      fromObject: Object.assign(
        {
          q: term,
          geometries: 'geom'
        },
        this.params,
        options.params || {}
      )
    });
  }

  private extractResults(response: IChercheResponse): SearchResult<Feature>[] {
    return response.features.map((data: IChercheData) => {
      return this.formatter.formatResult(this.dataToResult(data));
    });
  }

  private dataToResult(data: IChercheData): SearchResult<Feature> {
    const properties = this.computeProperties(data);
    const id = [this.getId(), properties.type, data._id].join('.');
    return {
      source: this,
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry: data.geometry,
        extent: data.bbox,
        properties,
        meta: {
          id,
          title: data.properties.recherche
        }
      },
      meta: {
        dataType: FEATURE,
        id,
        title: data.properties.recherche,
        titleHtml: data.highlight,
        icon: 'map-marker'
      }
    };
  }

  private computeProperties(data: IChercheData): { [key: string]: any } {
    const properties = ObjectUtils.removeKeys(
      data.properties,
      IChercheSearchSource.propertiesBlacklist
    );
    return Object.assign(properties, { type: data.doc_type });
  }
}

/**
 * IChercheReverse search source
 */
@Injectable()
export class IChercheReverseSearchSource extends SearchSource
  implements ReverseSearch {
  static id = 'icherchereverse';
  static type = FEATURE;
  static propertiesBlacklist: string[] = ['doc_type'];

  constructor(
    private http: HttpClient,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options);
  }

  getId(): string {
    return IChercheReverseSearchSource.id;
  }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'ICherche Québec (Géocodage inversé)',
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/icherche/xy',

      settings: [
        {
            type: 'checkbox',
            title: 'Type de résultat',
            name: 'type',
            values: [
              {
                title: 'Adresse',
                value: 'adresse',
                enabled: true
              },
              {
                title: 'Route',
                value: 'route',
                enabled: false
              },
              {
                title: 'Arrondissement',
                value: 'arrondissement',
                enabled: false
              },
              {
                title: 'Municipalité',
                value: 'municipalite',
                enabled: true
              },
              {
                title: 'mrc',
                value: 'mrc',
                enabled: true
              },
              {
                title: 'Région administrative',
                value: 'regadmin',
                enabled: true
              }
            ]
        }
      ]
    };
  }

  /**
   * Search a location by coordinates
   * @param lonLat Location coordinates
   * @param distance Search raidus around lonLat
   * @returns Observable of <SearchResult<Feature>[]
   */
  reverseSearch(
    lonLat: [number, number],
    options?: ReverseSearchOptions
  ): Observable<SearchResult<Feature>[]> {
    const params = this.computeRequestParams(lonLat, options || {});
    return this.http.get(this.searchUrl, { params }).pipe(
      map((response: IChercheReverseResponse) => {
        return this.extractResults(response);
      })
    );
  }

  private computeRequestParams(
    lonLat: [number, number],
    options?: ReverseSearchOptions
  ): HttpParams {
    const distance = options.distance;
    return new HttpParams({
      fromObject: Object.assign(
        {
          loc: lonLat.join(','),
          distance: distance ? String(distance) : '100',
          geometries: 'geom'
        },
        this.params,
        options.params || {}
      )
    });
  }

  private extractResults(
    response: IChercheReverseResponse
  ): SearchResult<Feature>[] {
    return response.features.map((data: IChercheReverseData) => {
      return this.dataToResult(data);
    });
  }

  private dataToResult(data: IChercheReverseData): SearchResult<Feature> {
    const properties = this.computeProperties(data);
    const extent = this.computeExtent(data);
    const id = [this.getId(), properties.type, data._id].join('.');

    return {
      source: this,
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry: data.geometry,
        extent,
        properties,
        meta: {
          id,
          title: data.properties.nom
        }
      },
      meta: {
        dataType: FEATURE,
        id,
        title: data.properties.nom,
        icon: 'map-marker'
      }
    };
  }

  private computeProperties(data: IChercheReverseData): { [key: string]: any } {
    const properties = ObjectUtils.removeKeys(
      data.properties,
      IChercheReverseSearchSource.propertiesBlacklist
    );
    return Object.assign(properties, { type: data.properties.doc_type });
  }

  private computeExtent(data: IChercheReverseData): [number, number, number, number] | undefined {
    return data.bbox
      ? [data.bbox[0], data.bbox[2], data.bbox[1], data.bbox[3]]
      : undefined;
  }
}
