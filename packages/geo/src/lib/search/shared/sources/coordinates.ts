import { Injectable, Inject } from '@angular/core';

import { Observable, BehaviorSubject, of } from 'rxjs';

import { FEATURE, Feature } from '../../../feature';

import { SearchResult } from '../search.interfaces';
import { SearchSource, ReverseSearch } from './source';
import { SearchSourceOptions, TextSearchOptions } from './source.interfaces';

import { LanguageService } from '@igo2/core';
import { GoogleLinks } from '../../../utils/googleLinks';
import { Projection } from '../../../map/shared/projection.interfaces';
import { lonLatConversion, roundCoordTo } from '../../../map/shared/map.utils';
import { OsmLinks } from '../../../utils';

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
      order: 1,
      showInSettings: false
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
    const convertedCoord = lonLatConversion(data, this.projections);
    const coords = convertedCoord.reduce((obj, item) => (
      obj[item.alias] = item.igo2CoordFormat, obj), {});

    const roundedCoordString = roundCoordTo(data, 6).join(', ');

    const coordKey =  this.languageService.translate.instant('igo.geo.search.coordinates.coord');
    const coordLonLat = {};
    coordLonLat[coordKey] = roundedCoordString;

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
        properties: Object.assign({},
          coordLonLat,
          coords,
          {
            GoogleMaps: GoogleLinks.getGoogleMapsCoordLink(data[0], data[1]),
            GoogleStreetView: GoogleLinks.getGoogleStreetViewLink(
              data[0],
              data[1]
            ),
            OpenStreetMap: OsmLinks.getOpenStreetMapLink(data[0], data[1], 14)
          },
          {
            Route: '<span class="routing"> <u>' + this.languageService.translate.instant('igo.geo.seeRouting') + '</u> </span>'
          }
          ),
        meta: {
          id: data[0].toString() + ',' + data[1].toString(),
          title: roundedCoordString
        }
      },
      meta: {
        dataType: FEATURE,
        id: data[0].toString() + ',' + data[1].toString(),
        title: roundedCoordString,
        icon: 'map-marker'
      }
    };
  }
}
