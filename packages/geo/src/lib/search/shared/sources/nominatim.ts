import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FEATURE, Feature, FeatureGeometry } from '../../../feature';

import { SearchResult } from '../search.interfaces';
import { SearchSource, TextSearch } from './source';
import { SearchSourceOptions, TextSearchOptions } from './source.interfaces';
import { NominatimData } from './nominatim.interfaces';

/**
 * Nominatim search source
 */
@Injectable()
export class NominatimSearchSource extends SearchSource implements TextSearch {
  static id = 'nominatim';
  static type = FEATURE;

  constructor(
    private http: HttpClient,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options);
  }

  getId(): string {
    return NominatimSearchSource.id;
  }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'Nominatim (OSM)',
      searchUrl: 'https://nominatim.openstreetmap.org/search'
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
    const params = this.computeSearchRequestParams(term, options || {});
    return this.http
      .get(this.searchUrl, { params })
      .pipe(map((response: NominatimData[]) => this.extractResults(response)));
  }

  private computeSearchRequestParams(
    term: string,
    options: TextSearchOptions
  ): HttpParams {
    return new HttpParams({
      fromObject: Object.assign(
        {
          q: term,
          format: 'json'
        },
        this.params,
        options.params || {}
      )
    });
  }

  private extractResults(response: NominatimData[]): SearchResult<Feature>[] {
    return response.map((data: NominatimData) => this.dataToResult(data));
  }

  private dataToResult(data: NominatimData): SearchResult<Feature> {
    const properties = this.computeProperties(data);
    const geometry = this.computeGeometry(data);
    const extent = this.computeExtent(data);
    const id = [this.getId(), 'place', data.place_id].join('.');

    return {
      source: this,
      meta: {
        dataType: FEATURE,
        id,
        title: data.display_name,
        icon: 'map-marker'
      },
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry,
        extent,
        properties,
        meta: {
          id,
          title: data.display_name
        }
      }
    };
  }

  private computeProperties(data: NominatimData): { [key: string]: any } {
    return {
      display_name: data.display_name,
      place_id: data.place_id,
      osm_type: data.osm_type,
      class: data.class,
      type: data.type
    };
  }

  private computeGeometry(data: NominatimData): FeatureGeometry {
    return {
      type: 'Point',
      coordinates: [parseFloat(data.lon), parseFloat(data.lat)]
    };
  }

  private computeExtent(data: NominatimData): [number, number, number, number] {
    return [
      parseFloat(data.boundingbox[2]),
      parseFloat(data.boundingbox[0]),
      parseFloat(data.boundingbox[3]),
      parseFloat(data.boundingbox[1])
    ];
  }
}
