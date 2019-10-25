import { Injectable, Inject } from '@angular/core';

import { Observable, BehaviorSubject, of } from 'rxjs';

import { FEATURE, Feature } from '../../../feature';

import { SearchResult } from '../search.interfaces';
import { SearchSource, ReverseSearch } from './source';
import { SearchSourceOptions, TextSearchOptions } from './source.interfaces';

import { LanguageService } from '@igo2/core';
import { GoogleLinks } from '../../../utils/googleLinks';

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
export class CoordinatesReverseSearchSource extends SearchSource
  implements ReverseSearch {
  static id = 'coordinatesreverse';
  static type = FEATURE;

  title$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get title(): string {
    return this.title$.getValue();
  }

  constructor(
    @Inject('options') options: SearchSourceOptions,
    private languageService: LanguageService
  ) {
    super(options);
    this.languageService.translate
      .get(this.options.title)
      .subscribe(title => this.title$.next(title));
  }

  getId(): string {
    return CoordinatesReverseSearchSource.id;
  }

  getType(): string {
    return CoordinatesReverseSearchSource.type;
  }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'igo.geo.search.coordinates.name',
      order: 1
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
    return of([this.dataToResult(lonLat)]);
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
          coordonnees: String(data[0].toFixed(5)) + ', ' + String(data[1].toFixed(5)),
          format: 'degrés decimaux',
          systemeCoordonnees: 'WGS84',
          GoogleMaps: GoogleLinks.getGoogleMapsLink(data[0], data[1]),
          GoogleStreetView: GoogleLinks.getGoogleStreetViewLink(
            data[0],
            data[1]
          )
        },
        meta: {
          id: '1',
          title: String(data[0].toFixed(5)) + ', ' + String(data[1].toFixed(5))
        }
      },
      meta: {
        dataType: FEATURE,
        id: '1',
        title: String(data[0].toFixed(5)) + ', ' + String(data[1].toFixed(5)),
        icon: 'map-marker'
      }
    };
  }
}
