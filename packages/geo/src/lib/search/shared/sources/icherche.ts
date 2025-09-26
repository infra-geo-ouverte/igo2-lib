import {
  HttpClient,
  HttpParameterCodec,
  HttpParams
} from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';

import { AuthService } from '@igo2/auth';
import { IconSvg } from '@igo2/common/icon';
import { LanguageService } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';
import { ObjectUtils, customCacheHasher } from '@igo2/utils';

import pointOnFeature from '@turf/point-on-feature';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';

import { FEATURE } from '../../../feature/shared/feature.enums';
import { Feature } from '../../../feature/shared/feature.interfaces';
import { ReverseSearch, SearchResult, TextSearch } from '../search.interfaces';
import { computeTermSimilarity } from '../search.utils';
import { GoogleLinks } from './../../../utils/googleLinks';
import { ICHERCHE_ICONS } from './icherche-icons';
import {
  IChercheData,
  IChercheResponse,
  IChercheReverseData,
  IChercheReverseResponse
} from './icherche.interfaces';
import { SearchSource } from './source';
import {
  ReverseSearchOptions,
  SearchSourceOptions,
  SearchSourceSettings,
  TextSearchOptions
} from './source.interfaces';

@Injectable()
export class IChercheSearchResultFormatter {
  constructor(private languageService: LanguageService) {}

  formatResult(result: SearchResult<Feature>): SearchResult<Feature> {
    return result;
  }
}

// Fix the "+" is replaced with space " " in a query string
// https://github.com/angular/angular/issues/11058
export class IgoHttpParameterCodec implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }

  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }

  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }

  decodeValue(value: string): string {
    return decodeURIComponent(value);
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
  title$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  private hashtagsLieuxToKeep = [];

  get title(): string {
    return this.title$.getValue();
  }

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    storageService: StorageService,
    @Inject('options') options: SearchSourceOptions,
    @Inject(IChercheSearchResultFormatter)
    private formatter: IChercheSearchResultFormatter,
    injector: Injector
  ) {
    super(options, storageService);

    const authService = injector.get(AuthService);
    if (this.settings.length) {
      if (!authService) {
        this.getAllowedTypes();
      } else {
        authService.authenticate$.subscribe(() => {
          this.getAllowedTypes();
        });
      }
    }

    this.languageService.language$.subscribe(() => {
      this.title$.next(
        this.languageService.translate.instant(this.options.title)
      );
    });
  }

  getId(): string {
    return IChercheSearchSource.id;
  }

  getType(): string {
    return IChercheSearchSource.type;
  }

  protected getDefaultOptions(): SearchSourceOptions {
    const limit =
      this.options.params && this.options.params.limit
        ? Number(this.options.params.limit)
        : undefined;
    const ecmax =
      this.options.params && this.options.params.ecmax
        ? Number(this.options.params.ecmax)
        : undefined;

    const types = this.options.params?.type
      ? this.options.params.type.replace(/\s/g, '').toLowerCase().split(',')
      : [
          'adresses',
          'codes-postaux',
          'routes',
          'intersections',
          'municipalites',
          'mrc',
          'regadmin',
          'lieux'
        ];

    const showAdvancedParams = this.options.showAdvancedSettings;

    return {
      title: 'igo.geo.search.icherche.name',
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/apis/icherche',
      settings: [
        {
          type: 'checkbox',
          title: 'results type',
          name: 'type',
          values: [
            {
              title: 'igo.geo.search.icherche.type.address',
              value: 'adresses',
              enabled: types.indexOf('adresses') !== -1,
              hashtags: ['adresse']
            },
            {
              title: 'igo.geo.search.icherche.type.oldAddress',
              value: 'anciennes-adresses',
              enabled: types.indexOf('anciennes-adresses') !== -1,
              hashtags: ['anciennes-adresses']
            },
            {
              title: 'igo.geo.search.icherche.type.oldCity',
              value: 'anciennes-municipalites',
              enabled: types.indexOf('anciennes-municipalites') !== -1,
              hashtags: ['anciennes-municipalites']
            },
            {
              title: 'igo.geo.search.icherche.type.cn',
              value: 'bornes-cn',
              enabled: types.indexOf('bornes-cn') !== -1,
              hashtags: ['borne', 'bornes', 'cn']
            },
            {
              title: 'igo.geo.search.icherche.type.sumi',
              value: 'bornes-sumi',
              enabled: types.indexOf('bornes-sumi') !== -1,
              hashtags: ['borne', 'bornes', 'sumi']
            },
            {
              title: 'igo.geo.search.icherche.type.cadastre',
              value: 'cadastre',
              enabled: types.indexOf('cadastre') !== -1,
              hashtags: ['cadastre']
            },
            {
              title: 'igo.geo.search.icherche.type.postalCode',
              value: 'codes-postaux',
              enabled: types.indexOf('codes-postaux') !== -1,
              hashtags: ['code-postal']
            },
            {
              title: 'igo.geo.search.icherche.type.entreprise',
              value: 'entreprises',
              enabled: types.indexOf('entreprises') !== -1,
              available: false,
              hashtags: ['entreprise']
            },
            {
              title: 'igo.geo.search.icherche.type.cycleStop',
              value: 'haltes_cyclables',
              enabled: types.indexOf('haltes_cyclables') !== -1,
              hashtags: ['haltevelo', 'haltes_cyclables']
            },
            {
              title: 'igo.geo.search.icherche.type.restArea',
              value: 'haltes_routieres',
              enabled: types.indexOf('haltes_routieres') !== -1,
              hashtags: ['halteroute', 'haltes_routieres']
            },
            {
              title: 'igo.geo.search.icherche.type.hq',
              value: 'hq',
              enabled: types.indexOf('hq') !== -1,
              hashtags: ['hq']
            },
            {
              title: 'igo.geo.search.icherche.type.intersection',
              value: 'intersections',
              enabled: types.indexOf('intersections') !== -1,
              hashtags: ['intersection', '+']
            },
            {
              title: 'igo.geo.search.icherche.type.place',
              value: 'lieux',
              enabled: types.indexOf('lieux') !== -1,
              hashtags: ['lieu']
            },
            {
              title: 'igo.geo.search.icherche.type.mrc',
              value: 'mrc',
              enabled: types.indexOf('mrc') !== -1,
              hashtags: ['mrc']
            },
            {
              title: 'igo.geo.search.icherche.type.city',
              value: 'municipalites',
              enabled: types.indexOf('municipalites') !== -1,
              hashtags: ['municipalité', 'mun']
            },
            {
              title: 'igo.geo.search.icherche.type.regadmin',
              value: 'regadmin',
              enabled: types.indexOf('regadmin') !== -1,
              hashtags: ['région-administrative', 'regadmin']
            },
            {
              title: 'igo.geo.search.icherche.type.gcc',
              value: 'bornes-gcc',
              enabled: types.indexOf('bornes-gcc') !== -1,
              hashtags: ['borne', 'bornes', 'repère', 'gcc', 'ccg']
            },
            {
              title: 'igo.geo.search.icherche.type.km',
              value: 'bornes-km',
              enabled: types.indexOf('bornes-km') !== -1,
              hashtags: ['borne', 'bornes', 'repère', 'km']
            },
            {
              title: 'igo.geo.search.icherche.type.road',
              value: 'routes',
              enabled: types.indexOf('routes') !== -1,
              hashtags: ['route']
            },
            {
              title: 'igo.geo.search.icherche.type.exit',
              value: 'sorties-autoroute',
              enabled: types.indexOf('sorties-autoroute') !== -1,
              hashtags: ['sortie', 'sorties', 'exit']
            },
            {
              title: 'igo.geo.search.icherche.type.cultpatri',
              value: 'culture',
              enabled: types.indexOf('culture') !== -1,
              hashtags: ['grille', 'culture']
            },
            {
              title: 'igo.geo.search.icherche.type.unites',
              value: 'unites',
              enabled: types.indexOf('unites') !== -1,
              hashtags: ['unites', 'adresse']
            }
          ]
        } satisfies SearchSourceSettings,
        {
          type: 'radiobutton',
          title: 'results limit',
          name: 'limit',
          values: [
            {
              title: '1',
              value: 1,
              enabled: limit === 1
            },
            {
              title: '5',
              value: 5,
              enabled: limit === 5 || !limit
            },
            {
              title: '10',
              value: 10,
              enabled: limit === 10
            },
            {
              title: '25',
              value: 25,
              enabled: limit === 25
            },
            {
              title: '50',
              value: 50,
              enabled: limit === 50
            }
          ]
        } satisfies SearchSourceSettings,
        showAdvancedParams &&
          ({
            type: 'radiobutton',
            title: 'ecmax',
            name: 'ecmax',
            values: [
              {
                title: '10 %',
                value: 10,
                enabled: ecmax === 10
              },
              {
                title: '30 %',
                value: 30,
                enabled: ecmax === 30 || !ecmax
              },
              {
                title: '50 %',
                value: 50,
                enabled: ecmax === 50
              },
              {
                title: '75 %',
                value: 75,
                enabled: ecmax === 75
              },
              {
                title: '100 %',
                value: 100,
                enabled: ecmax === 100
              }
            ]
          } satisfies SearchSourceSettings),
        {
          type: 'radiobutton',
          title: 'restrictExtent',
          name: 'loc',
          values: [
            {
              title: 'igo.geo.search.icherche.restrictExtent.map',
              value: 'true',
              enabled: false
            },
            {
              title: 'igo.geo.search.icherche.restrictExtent.quebec',
              value: 'false',
              enabled: true
            }
          ]
        } satisfies SearchSourceSettings
      ].filter(Boolean)
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
    if (!params.get('type').length) {
      return of([]);
    }
    this.options.params.page = params.get('page') || '1';

    return this.getSearch(term, params);
  }

  @Cacheable({
    maxCacheCount: 20,
    cacheHasher: customCacheHasher
  })
  private getSearch(
    term: string,
    params: HttpParams
  ): Observable<SearchResult<Feature>[]> {
    return this.http.get(`${this.searchUrl}/geocode`, { params }).pipe(
      map((response: IChercheResponse) => this.extractResults(response, term)),
      catchError((err) => {
        err.error.toDisplay = true;
        err.error.title = this.languageService.translate.instant(
          this.getDefaultOptions().title
        );
        throw err;
      })
    );
  }
  private getAllowedTypes() {
    return this.http
      .get(`${this.searchUrl}/types`)
      .subscribe((types: string[]) => {
        const typeSetting = this.settings.find((s) => s.name === 'type');
        typeSetting.values.forEach((v) => {
          const regex = new RegExp(`^${v.value}(\\.|$)`);
          const typesMatched = types.filter((value) => regex.test(value));
          v.available = typesMatched.length > 0;
          if (v.value === 'lieux') {
            this.hashtagsLieuxToKeep = [
              ...(new Set(
                typesMatched
                  .map((t) => t.split('.'))
                  .reduce((a, b) => a.concat(b))
                  .filter((t) => t !== 'lieux')
              ) as any)
            ];
          }
        });
        this.setParamFromSetting(typeSetting, false);
      });
  }

  private computeRequestParams(
    term: string,
    options: TextSearchOptions
  ): HttpParams {
    const queryParams: any = Object.assign(
      {
        geometry: true,
        bbox: true,
        icon: true,
        type: 'adresses,codes-postaux,municipalites,mrc,regadmin,lieux,entreprises,bornes-sumi'
      },
      this.params,
      this.computeOptionsParam(term, options || {}).params,
      {
        q: this.computeTerm(term),
        page: options.page
      }
    );

    if (queryParams.loc === 'true') {
      const [xMin, yMin, xMax, yMax] = options.extent;
      queryParams.loc = `${xMin},${yMin};${xMax},${yMin};${xMax},${yMax};${xMin},${yMax};${xMin},${yMin}`;
    } else if (queryParams.loc === 'false') {
      delete queryParams.loc;
    }

    if (/#[A-Za-z]+/.test(queryParams.q)) {
      queryParams.type = 'lieux';
    }

    return new HttpParams({
      fromObject: ObjectUtils.removeUndefined(queryParams),
      encoder: new IgoHttpParameterCodec()
    });
  }

  private extractResults(
    response: IChercheResponse,
    term: string
  ): SearchResult<Feature>[] {
    return response.features.map((data: IChercheData) => {
      return this.formatter.formatResult(
        this.dataToResult(data, term, response)
      );
    });
  }

  private dataToResult(
    data: IChercheData,
    term: string,
    response?: IChercheResponse
  ): SearchResult<Feature> {
    const properties = this.computeProperties(data);
    const id = [this.getId(), properties.type, properties.code].join('.');

    const titleHtml = data.highlight.title || data.properties.nom;
    const subtitleHtml = data.highlight.title2
      ? ' <small> ' + data.highlight.title2 + '</small>'
      : '';
    const subtitleHtml2 = data.highlight.title3
      ? '<br><small> ' + data.highlight.title3 + '</small>'
      : '';

    let icon: string | IconSvg = data.icon;
    if (typeof icon == 'string' && Object.keys(ICHERCHE_ICONS).includes(icon)) {
      icon = ICHERCHE_ICONS[icon];
    }

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
        titleHtml: titleHtml + subtitleHtml + subtitleHtml2,
        icon: icon || 'location_on',
        score:
          data.score || computeTermSimilarity(term.trim(), data.properties.nom),
        nextPage:
          response.features.length % +this.options.params.limit === 0 &&
          +this.options.params.page < 10
      }
    };
  }

  private computeProperties(data: IChercheData): Record<string, any> {
    const properties = ObjectUtils.removeKeys(
      data.properties,
      IChercheSearchSource.propertiesBlacklist
    );

    if (!data.geometry) {
      return Object.assign({ type: data.index }, properties);
    }

    const googleLinksProperties: {
      GoogleMaps: string;
      GoogleStreetView?: string;
    } = {
      GoogleMaps: ''
    };

    let googleMaps;
    if (data.geometry.type === 'Point') {
      googleMaps = GoogleLinks.getGoogleMapsCoordLink(
        data.geometry.coordinates[0],
        data.geometry.coordinates[1]
      );
    } else {
      const point = pointOnFeature(data.geometry);
      googleMaps = GoogleLinks.getGoogleMapsCoordLink(
        point.geometry.coordinates[0],
        point.geometry.coordinates[1]
      );
    }

    let googleMapsNom;
    if (data.index === 'routes') {
      googleMapsNom = GoogleLinks.getGoogleMapsNameLink(
        data.properties.nom + ', ' + data.properties.municipalite
      );
    } else if (data.index === 'municipalites') {
      googleMapsNom = GoogleLinks.getGoogleMapsNameLink(
        data.properties.nom + ', ' + 'ville'
      );
    } else if (data.index === 'mrc') {
      googleMapsNom = GoogleLinks.getGoogleMapsNameLink(
        'mrc+' + data.properties.nom
      );
    } else if (data.index === 'regadmin') {
      googleMapsNom = GoogleLinks.getGoogleMapsNameLink(
        data.properties.nom + ',+QC'
      );
    } else {
      googleMapsNom = GoogleLinks.getGoogleMapsNameLink(
        data.properties.nom || data.highlight.title
      );
    }

    googleLinksProperties.GoogleMaps =
      '<a href=' +
      googleMaps +
      ' target="_blank">' +
      this.languageService.translate.instant('igo.geo.searchByCoord') +
      '</a> <br /> <a href=' +
      googleMapsNom +
      ' target="_blank">' +
      this.languageService.translate.instant('igo.geo.searchByName') +
      '</a>';

    if (data.geometry.type === 'Point') {
      googleLinksProperties.GoogleStreetView =
        GoogleLinks.getGoogleStreetViewLink(
          data.geometry.coordinates[0],
          data.geometry.coordinates[1]
        );
    }

    const routing: {
      Route: string;
    } = {
      Route:
        '<span class="routing"> <u>' +
        this.languageService.translate.instant('igo.geo.seeRouting') +
        '</u> </span>'
    };

    return Object.assign(
      { type: data.index },
      properties,
      googleLinksProperties,
      routing
    );
  }

  /**
   * Remove hashtag from query
   * @param term Query with hashtag
   */
  private computeTerm(term: string): string {
    // Keep hashtags for "lieux"
    const hashtags = term.match(/(#[A-Za-z]+)/g) || [];
    let keep = false;
    keep = hashtags.some((hashtag) => {
      const hashtagKey = String(hashtag).substring(1);
      return this.hashtagsLieuxToKeep.some(
        (h) =>
          h
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') ===
          hashtagKey
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
      );
    });

    if (!keep) {
      term = term.replace(/(#[A-Za-z]+)/g, '');
    }

    return term.replace(/[^\wÀ-ÿ !\-\+\(\)\.\/½¼¾,'#]+/g, '');
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
    const hashtags = super.getHashtagsValid(term, 'type');
    if (hashtags) {
      options.params = Object.assign(options.params || {}, {
        type: hashtags.join(',')
      });
    }

    return options;
  }
}

/**
 * IChercheReverse search source
 */
@Injectable()
export class IChercheReverseSearchSource
  extends SearchSource
  implements ReverseSearch
{
  static id = 'icherchereverse';
  static type = FEATURE;
  static propertiesBlacklist: string[] = [];

  title$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get title(): string {
    return this.title$.getValue();
  }

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    storageService: StorageService,
    @Inject('options') options: SearchSourceOptions,
    injector: Injector
  ) {
    super(options, storageService);

    this.languageService.language$.subscribe(() => {
      this.title$.next(
        this.languageService.translate.instant(this.options.title)
      );
    });

    const authService = injector.get(AuthService);
    if (this.settings.length) {
      if (!authService) {
        this.getAllowedTypes();
      } else {
        authService.authenticate$.subscribe(() => {
          this.getAllowedTypes();
        });
      }
    }
  }

  getId(): string {
    return IChercheReverseSearchSource.id;
  }

  getType(): string {
    return IChercheReverseSearchSource.type;
  }

  protected getDefaultOptions(): SearchSourceOptions {
    const types =
      this.options.params && this.options.params.type
        ? this.options.params.type.replace(/\s/g, '').toLowerCase().split(',')
        : ['adresses', 'municipalites', 'mrc', 'regadmin'];

    return {
      title: 'igo.geo.search.ichercheReverse.name',
      searchUrl: 'https://geoegl.msp.gouv.qc.ca/apis/terrapi',
      settings: [
        {
          type: 'checkbox',
          title: 'results type',
          name: 'type',
          values: [
            {
              title: 'igo.geo.search.icherche.type.address',
              value: 'adresses',
              enabled: types.indexOf('adresses') !== -1
            },
            {
              title: 'igo.geo.search.icherche.type.road',
              value: 'routes',
              enabled: types.indexOf('routes') !== -1,
              available: false
            },
            {
              title: 'igo.geo.search.icherche.type.district',
              value: 'arrondissements',
              enabled: types.indexOf('arrondissements') !== -1
            },
            {
              title: 'igo.geo.search.icherche.type.city',
              value: 'municipalites',
              enabled: types.indexOf('municipalites') !== -1
            },
            {
              title: 'igo.geo.search.icherche.type.mrc',
              value: 'mrc',
              enabled: types.indexOf('mrc') !== -1
            },
            {
              title: 'igo.geo.search.icherche.type.regadmin',
              value: 'regadmin',
              enabled: types.indexOf('regadmin') !== -1
            },
            {
              title: 'igo.geo.search.icherche.type.unites',
              value: 'unites',
              enabled: types.indexOf('unites') !== -1
            },
            {
              title: 'igo.geo.search.icherche.type.tours',
              value: 'tours',
              enabled: types.indexOf('tours') !== -1
            },
            {
              title: 'igo.geo.search.icherche.type.rss',
              value: 'rss',
              enabled: types.indexOf('rss') !== -1
            },
            {
              title: 'igo.geo.search.icherche.type.rls',
              value: 'rls',
              enabled: types.indexOf('rls') !== -1
            },
            {
              title: 'igo.geo.search.icherche.type.clsc',
              value: 'clsc',
              enabled: types.indexOf('clsc') !== -1
            }
          ]
        },
        {
          type: 'radiobutton',
          title: 'radius',
          name: 'bufferInput',
          values: [
            {
              title: '100 m',
              value: 100,
              enabled: !this.options.distance || this.options.distance === 100
            },
            {
              title: '500 m',
              value: 500,
              enabled: this.options.distance === 500
            },
            {
              title: '1 km',
              value: 1000,
              enabled: this.options.distance === 1000
            },
            {
              title: '2 km',
              value: 2000,
              enabled: this.options.distance === 2000
            },
            {
              title: '5 km',
              value: 5000,
              enabled: this.options.distance === 5000
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
    if (!params.get('type').length) {
      return of([]);
    }
    return this.getReverseSearch(params);
  }

  @Cacheable({
    maxCacheCount: 20,
    cacheHasher: customCacheHasher
  })
  private getReverseSearch(
    params: HttpParams
  ): Observable<SearchResult<Feature>[]> {
    return this.http.get(`${this.searchUrl}/locate`, { params }).pipe(
      map((response: IChercheReverseResponse) => {
        return this.extractResults(response);
      })
    );
  }

  private getAllowedTypes() {
    return this.http
      .get(`${this.searchUrl}/types`)
      .subscribe((types: string[]) => {
        const typeSetting = this.settings.find((s) => s.name === 'type');
        typeSetting.values.forEach((v) => {
          v.available = types.indexOf(v.value as string) > -1;
        });
        this.setParamFromSetting(typeSetting, false);
      });
  }

  private computeRequestParams(
    lonLat: [number, number],
    options?: ReverseSearchOptions
  ): HttpParams {
    if (options.distance || this.options.distance) {
      options.params = Object.assign(options.params || {}, {
        bufferInput: options.distance || this.options.distance
      });
    }

    return new HttpParams({
      fromObject: Object.assign(
        {
          loc: lonLat.join(','),
          sort: 'distance',
          geometry: true,
          icon: true
        },
        options.params || {},
        this.params
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

  private getSubtitle(data: IChercheReverseData) {
    if (!this.settings.length) {
      return '';
    }
    let subtitle = '';
    switch (data.properties.type) {
      case 'arrondissements':
        subtitle = data.properties.municipalite + ' (Arrondissement)';
        break;
      default: {
        const typeSetting = this.settings.find((s) => s.name === 'type');
        const type = typeSetting.values.find(
          (t) => t.value === data.properties.type
        );
        if (type) {
          subtitle = this.languageService.translate.instant(type.title);
        }
      }
    }
    return subtitle;
  }

  private dataToResult(data: IChercheReverseData): SearchResult<Feature> {
    const properties = this.computeProperties(data);
    const extent = this.computeExtent(data);
    const id = [this.getId(), properties.type, properties.code].join('.');

    const titleHtml = data.properties.nom;
    const subtitleHtml = ' <small> ' + this.getSubtitle(data) + '</small>';

    let icon: string | IconSvg = data.icon;
    if (typeof icon == 'string' && Object.keys(ICHERCHE_ICONS).includes(icon)) {
      icon = ICHERCHE_ICONS[icon];
    }

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
        titleHtml: titleHtml + subtitleHtml,
        icon: icon || 'location_on',
        pointerSummaryTitle: this.getSubtitle(data) + ': ' + data.properties.nom
      }
    };
  }

  private computeProperties(data: IChercheReverseData): Record<string, any> {
    const properties = ObjectUtils.removeKeys(
      data.properties,
      IChercheReverseSearchSource.propertiesBlacklist
    );

    const routing: {
      Route: string;
    } = {
      Route:
        '<span class="routing"> <u>' +
        this.languageService.translate.instant('igo.geo.seeRouting') +
        '</u> </span>'
    };

    return Object.assign(properties, routing);
  }

  private computeExtent(
    data: IChercheReverseData
  ): [number, number, number, number] | undefined {
    return data.bbox
      ? [data.bbox[0], data.bbox[2], data.bbox[1], data.bbox[3]]
      : undefined;
  }
}
