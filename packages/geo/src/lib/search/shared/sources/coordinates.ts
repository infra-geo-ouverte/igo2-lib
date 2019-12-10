import { Injectable, Inject } from '@angular/core';

import { Observable, BehaviorSubject, of } from 'rxjs';

import { FEATURE, Feature } from '../../../feature';

import { SearchResult } from '../search.interfaces';
import { SearchSource, ReverseSearch } from './source';
import { SearchSourceOptions, TextSearchOptions } from './source.interfaces';

import { LanguageService } from '@igo2/core';
import { GoogleLinks } from '../../../utils/googleLinks';
import { Projection } from '../../../map/shared/projection.interfaces';
import { lonLatConversion } from '../../../map/shared/map.utils';

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

  private projections;

  title$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get title(): string {
    return this.title$.getValue();
  }

  constructor(
    @Inject('options') options: SearchSourceOptions,
    private languageService: LanguageService,
    @Inject('projections') projections: Projection[],
  ) {
    super(options);
    this.projections = projections;
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

  roundToFiveDecimals(num: number) {
    return Math.round(Number(num * 100000)) / 100000;
  }

  private dataToResult(data: [number, number]): SearchResult<Feature> {
    const convertedCoord = lonLatConversion(data, this.projections);
    const coords = convertedCoord.reduce((obj, item) => (
      obj[item.alias] = String(this.roundToFiveDecimals(item.coord[0])) + ', '
      + String(this.roundToFiveDecimals(item.coord[1])), obj), {});

    const roundedCoordString = String(this.roundToFiveDecimals(data[0])) + ', ' + String(this.roundToFiveDecimals(data[1]));
    // provide the right syntax to trigger search by coordinate in the app.
    this.projections.forEach(projection => {
      coords[projection.alias] = `${coords[projection.alias]};${projection.code.split(':')[1]}`;
    });

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
        properties: Object.assign({}, {
          type: 'point',
          coordonnees: roundedCoordString,
          format: 'degrés decimaux',
          systemeCoordonnees: 'WGS84',
          GoogleMaps: GoogleLinks.getGoogleMapsLink(data[0], data[1]),
          GoogleStreetView: GoogleLinks.getGoogleStreetViewLink(
            data[0],
            data[1]
          )
        }, coords),
        meta: {
          id: '1',
          title: roundedCoordString
        }
      },
      meta: {
        dataType: FEATURE,
        id: '1',
        title: roundedCoordString,
        icon: 'map-marker'
      }
    };
  }
}
