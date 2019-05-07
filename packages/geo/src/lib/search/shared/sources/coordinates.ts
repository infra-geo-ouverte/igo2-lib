import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { FEATURE, Feature } from '../../../feature';

import { SearchResult } from '../search.interfaces';
import { SearchSource, ReverseSearch } from './source';
import {
  SearchSourceOptions,
  TextSearchOptions
} from './source.interfaces';

import {LanguageService} from '@igo2/core';
import {GoogleLinks} from '../../../utils/googleLinks';

@Injectable()
export class CoordinatesSearchResultFormatter {
  constructor(private languageService: LanguageService) {}

  formatResult(result: SearchResult<Feature>): SearchResult<Feature> {
    return result;
  }
}
/**
 * CoordinatesReverse search source
 */
@Injectable()
export class CoordinatesReverseSearchSource extends SearchSource implements ReverseSearch {
  static id = 'coordinatesreverse';
  static type = FEATURE;
  static propertiesBlacklist: string[] = ['doc_type'];

  constructor(
    private http: HttpClient,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options);
  }

  getId(): string {
    return CoordinatesReverseSearchSource.id;
  }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'Coordinates'
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
    options?: TextSearchOptions
  ): Observable<SearchResult<Feature>[]> {
    return of( [this.dataToResult(lonLat)]);
  }

  private dataToResult(data: [number, number]): SearchResult<Feature> {
    return {
      source: this,
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry: {
          type: 'Point',
          coordinates: [data[0], data[1]]
        },
        extent: undefined,
        properties: {
          type: 'point',
          coordonnees: String(data[0]) + ', ' + String(data[1]),
          systemeCoordonnees: 'WGS84',
          GoogleMaps: GoogleLinks.getGoogleMapsLink(data[1], data[0]),
          GoogleStreetView: GoogleLinks.getGoogleStreetViewLink(data[1], data[0])
        }
      },
      meta: {
        dataType: FEATURE,
        id: '1',
        title: String(data[0]) + ', ' + String(data[1]),
        icon: 'place'
      }
    };
  }
}
