import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { LanguageService } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';
import { customCacheHasher } from '@igo2/utils';

import olWKT from 'ol/format/WKT';

import { GeoJsonGeometryTypes } from 'geojson';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';

import { FEATURE } from '../../../feature/shared/feature.enums';
import {
  Feature,
  FeatureGeometry
} from '../../../feature/shared/feature.interfaces';
import { SearchResult, TextSearch } from '../search.interfaces';
import { computeTermSimilarity } from '../search.utils';
import { SearchSource } from './source';
import { SearchSourceOptions, TextSearchOptions } from './source.interfaces';

/**
 * Cadastre search source
 */
@Injectable()
export class CadastreSearchSource extends SearchSource implements TextSearch {
  static id = 'cadastre';
  static type = FEATURE;

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    storageService: StorageService,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options, storageService);
  }

  getId(): string {
    return CadastreSearchSource.id;
  }

  getType(): string {
    return CadastreSearchSource.type;
  }

  /*
   * Source : https://wiki.openstreetmap.org/wiki/Key:amenity
   */
  getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'Cadastre (Québec)',
      searchUrl: 'https://carto.cptaq.gouv.qc.ca/php/find_lot_v1.php?'
    };
  }

  /**
   * Search a place by name
   * @param term Place name
   * @returns Observable of <SearchResult<Feature>[]
   */
  search(
    term: string | undefined,
    options?: TextSearchOptions
  ): Observable<SearchResult<Feature>[]> {
    term = term.replace(/ /g, '');
    term = term.replace(/,+/g, ',');
    term = term.endsWith(',') ? term.slice(0, -1) : term;
    term = term.startsWith(',') ? term.substr(1) : term;

    const params = this.computeSearchRequestParams(term, options || {});
    if (!params.get('numero') || !params.get('numero').match(/^[0-9,]+$/g)) {
      return of([]);
    }
    return this.getCadastre(term, params);
  }

  @Cacheable({
    maxCacheCount: 20,
    cacheHasher: customCacheHasher
  })
  private getCadastre(
    term: string,
    params: HttpParams
  ): Observable<SearchResult<Feature>[]> {
    return this.http
      .get(this.searchUrl, { params, responseType: 'text' })
      .pipe(map((response: string) => this.extractResults(response, term)));
  }

  private computeSearchRequestParams(
    term: string,
    options: TextSearchOptions
  ): HttpParams {
    return new HttpParams({
      fromObject: Object.assign(
        {
          numero: term,
          epsg: '4326'
        },
        this.params,
        options.params || {}
      )
    });
  }

  private extractResults(
    response: string,
    term: string
  ): SearchResult<Feature>[] {
    return response
      .split('<br />')
      .filter((lot: string) => lot.length > 0)
      .map((lot: string) => this.dataToResult(lot, term));
  }

  private dataToResult(data: string, term: string): SearchResult<Feature> {
    const lot = data.split(';');
    const numero = lot[0];
    const wkt = lot[7];
    const geometry = this.computeGeometry(wkt);

    const properties = {
      NoLot: numero,
      Route:
        '<span class="routing"> <u>' +
        this.languageService.translate.instant('igo.geo.seeRouting') +
        '</u> </span>'
    };
    const id = [this.getId(), 'cadastre', numero].join('.');

    return {
      source: this,
      meta: {
        dataType: FEATURE,
        id,
        title: numero,
        score: computeTermSimilarity(term.trim(), numero),
        icon: 'map-marker'
      },
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry,
        properties,
        meta: {
          id,
          title: numero
        }
      }
    };
  }

  private computeGeometry(wkt: string): FeatureGeometry {
    const feature = new olWKT().readFeature(wkt, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:4326'
    });
    return {
      type: feature.getGeometry().getType() as GeoJsonGeometryTypes,
      coordinates: (feature.getGeometry() as any).getCoordinates()
    };
  }
}
