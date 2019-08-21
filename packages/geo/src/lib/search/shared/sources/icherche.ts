import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';

import { ObjectUtils } from '@igo2/utils';

import { FEATURE, Feature } from '../../../feature';
import { GoogleLinks } from './../../../utils/googleLinks';

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
  static propertiesBlacklist: string[] = [];

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
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/apis/icherche/geocode',
      settings: [
        {
          type: 'checkbox',
          title: 'results type',
          name: 'type',
          values: [
            {
              title: 'Adresse',
              value: 'adresses',
              enabled: true
            },
            // {
            //   title: 'Ancienne adresse',
            //   value: 'ancienne_adresse',
            //   enabled: true
            // },
            {
              title: 'Code Postal',
              value: 'codes-postaux',
              enabled: true
            },
            {
              title: 'Route',
              value: 'routes',
              enabled: false
            },
            {
              title: 'Municipalité',
              value: 'municipalites',
              enabled: true
            },
            // {
            //   title: 'Ancienne municipalité',
            //   value: 'ancienne_municipalite',
            //   enabled: true
            // },
            {
              title: 'mrc',
              value: 'mrc',
              enabled: true
            },
            {
              title: 'Région administrative',
              value: 'regadmin',
              enabled: true
            },
            {
              title: 'Lieu',
              value: 'lieux',
              enabled: true
            },
            {
              title: 'Borne',
              value: 'bornes',
              enabled: false
            },
            {
              title: 'Entreprise',
              value: 'entreprises',
              enabled: false
            }
          ]
        },
        {
          type: 'radiobutton',
          title: 'results limit',
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
            },
            {
              title: '25',
              value: 25,
              enabled: false
            },
            {
              title: '50',
              value: 50,
              enabled: false
            }
          ]
        },
        {
          type: 'radiobutton',
          title: 'trust level',
          name: 'ecmax',
          values: [
            {
              title: '10',
              value: 10,
              enabled: false
            },
            {
              title: '30',
              value: 30,
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
    return this.http.get(this.searchUrl, { params }).pipe(
      map((response: IChercheResponse) => this.extractResults(response)),
      catchError(err => {
        err.error.toDisplay = true;
        err.error.title = this.getDefaultOptions().title;
        throw err;
      })
    );
  }

  private computeRequestParams(
    term: string,
    options: TextSearchOptions
  ): HttpParams {
    return new HttpParams({
      fromObject: Object.assign(
        {
          q: this.computeTerm(term),
          geometry: true,
          type:
            'adresses,codes-postaux,municipalites,mrc,regadmin,lieux,entreprises,bornes'
        },
        this.params,
        this.computeOptionsParam(term, options || {}).params
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
    const id = [this.getId(), properties.type, properties.code].join('.');

    const titleHtml = data.highlight.title || data.properties.nom;
    const subtitleHtml = data.highlight.title2
      ? ' <small> ' + data.highlight.title2 + '</small>'
      : '';

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
          title: data.properties.nom
        }
      },
      meta: {
        dataType: FEATURE,
        id,
        title: data.properties.nom,
        titleHtml: titleHtml + subtitleHtml,
        icon: 'map-marker'
      }
    };
  }

  private computeProperties(data: IChercheData): { [key: string]: any } {
    const properties = ObjectUtils.removeKeys(
      data.properties,
      IChercheSearchSource.propertiesBlacklist
    );

    const googleLinksProperties: {
      GoogleMaps: string;
      GoogleStreetView?: string;
    } = {
      GoogleMaps: GoogleLinks.getGoogleMapsLink(
        data.geometry.coordinates[0],
        data.geometry.coordinates[1]
      )
    };
    if (data.geometry.type === 'Point') {
      googleLinksProperties.GoogleStreetView = GoogleLinks.getGoogleStreetViewLink(
        data.geometry.coordinates[0],
        data.geometry.coordinates[1]
      );
    }

    return Object.assign(
      { type: data.index },
      properties,
      googleLinksProperties
    );
  }

  /**
   * Remove hashtag from query
   * @param term Query with hashtag
   */
  private computeTerm(term: string): string {
    return term.replace(/(#[^\s]*)/g, '');
  }

  /**
   * Add hashtag to param if valid
   * @param term Query with hashtag
   * @param options TextSearchOptions
   */
  private computeOptionsParam(
    term: string,
    options: TextSearchOptions
  ): TextSearchOptions {
    const tags = term.match(/(#[^\s]+)/g);
    if (tags) {
      let typeValue = '';
      let hashtagToAdd = false;
      tags.forEach(value => {
        if (super.hashtagValid(super.getSettingsValues('type'), value, true)) {
          typeValue += value.substring(1) + ',';
          hashtagToAdd = true;
        }
      });
      if (hashtagToAdd) {
        options.params = Object.assign(options.params || {}, {
          type: typeValue.slice(0, -1)
        });
      }
    }
    return options;
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
      title: 'Territoire (Géocodage inversé)',
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/apis/territoires/locate',

      settings: [
        {
          type: 'checkbox',
          title: 'results type',
          name: 'type',
          values: [
            {
              title: 'Adresse',
              value: 'adresses',
              enabled: true
            },
            {
              title: 'Route',
              value: 'routes',
              enabled: false
            },
            {
              title: 'Arrondissement',
              value: 'arrondissements',
              enabled: false
            },
            {
              title: 'Municipalité',
              value: 'municipalites',
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
          buffer: distance ? String(distance) : '100',
          geometry: true
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
    const id = [this.getId(), properties.type, properties.code].join('.');

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
    return properties;
  }

  private computeExtent(
    data: IChercheReverseData
  ): [number, number, number, number] | undefined {
    return data.bbox
      ? [data.bbox[0], data.bbox[2], data.bbox[1], data.bbox[3]]
      : undefined;
  }
}
