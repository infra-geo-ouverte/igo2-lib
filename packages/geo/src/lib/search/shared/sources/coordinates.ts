import { Injectable, Inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import * as olproj from 'ol/proj';
import { fromCircle } from 'ol/geom/Polygon';
import OlCircle from 'ol/geom/Circle';
import * as olformat from 'ol/format';

import { FEATURE, Feature, FeatureGeometry } from '../../../feature';

import { SearchResult } from '../search.interfaces';
import { SearchSource, ReverseSearch } from './source';
import { SearchSourceOptions, ReverseSearchOptions } from './source.interfaces';

import { LanguageService, StorageService } from '@igo2/core';
import { GoogleLinks } from '../../../utils/googleLinks';
import { Projection } from '../../../map/shared/projection.interfaces';
import { lonLatConversion, roundCoordTo, convertDDToDMS } from '../../../map/shared/map.utils';
import { OsmLinks } from '../../../utils';
import { Cacheable } from 'ts-cacheable';

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
    storageService: StorageService,
    @Inject('projections') projections: Projection[]
  ) {
    super(options, storageService);
    this.projections = projections;
    this.languageService.language$.subscribe(() => {
      this.title$.next(this.languageService.translate.instant(this.options.title));
    });
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
   * @param options options of ReverseSearchOptions (distance, conf, zoom, params)
   * @returns Observable of <SearchResult<Feature>[]
   */
  @Cacheable({
    maxCacheCount: 20
  })
  reverseSearch(
    lonLat: [number, number],
    options?: ReverseSearchOptions,
    reverseSearchCoordsFormatEnabled?: boolean
  ): Observable<SearchResult<Feature>[]> {
    return of([this.dataToResult(lonLat, options, reverseSearchCoordsFormatEnabled)]);
  }

  private dataToResult(data: [number, number], options: ReverseSearchOptions,
    reverseSearchCoordsFormatEnabled: boolean): SearchResult<Feature> {

    const dataDMS = convertDDToDMS(data);
    const convertedCoord = lonLatConversion(data, this.projections);
    const coords = convertedCoord.reduce((obj, item) => (
      obj[item.alias] = item.igo2CoordFormat, obj), {});

    const roundedCoordString = (!reverseSearchCoordsFormatEnabled) ?
      roundCoordTo(data, 6).join(', ') : roundCoordTo(data, 6).reverse().join(', ');

    const roundedCoordStringDMS = (!reverseSearchCoordsFormatEnabled) ?
      dataDMS.join(', ') : dataDMS.reverse().join(', ');

    let geometry: FeatureGeometry = {
      type: 'Point',
      coordinates: [data[0], data[1]]
    };

    const properties = {};
    let subtitleHtml = '';
    if (options.distance) {
      const radiusKey = this.languageService.translate.instant('igo.geo.search.coordinates.radius');
      properties[radiusKey] = options.distance;
      subtitleHtml = '<br><small>Rayon: ' + options.distance + ' m</small>';

      // Create polygon
      const center = olproj.transform([data[0], data[1]], 'EPSG:4326', 'EPSG:3857');
      const circleGeometry = new OlCircle(center, options.distance);
      const polygonGeometry = fromCircle(circleGeometry);
      const writer = new olformat.GeoJSON();
      geometry = JSON.parse(writer.writeGeometry(polygonGeometry.transform('EPSG:3857', 'EPSG:4326')));
    }

    if (options.conf) {
      const confKey = this.languageService.translate.instant('igo.geo.search.coordinates.conf');
      properties[confKey] = options.conf;
      subtitleHtml += subtitleHtml === '' ? '<br>' : '<small> - </small>';
      subtitleHtml += '<small>Confiance: ' + options.conf + '%</small>';
    }

    const coordKey = (!reverseSearchCoordsFormatEnabled) ?
      this.languageService.translate.instant('igo.geo.search.coordinates.coord'):
      this.languageService.translate.instant('igo.geo.search.coordinates.reversedCoord');
    properties[coordKey] = roundedCoordString;

    const coordKeyDMS = (!reverseSearchCoordsFormatEnabled) ?
     this.languageService.translate.instant('igo.geo.search.coordinates.coordDMS'):
     this.languageService.translate.instant('igo.geo.search.coordinates.reversedCoordDMS');
    properties[coordKeyDMS] = roundedCoordStringDMS;

    return {
      source: this,
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry,
        extent: undefined,
        properties: Object.assign(
          properties,
          coords,
          {
            GoogleMaps: GoogleLinks.getGoogleMapsCoordLink(data[0], data[1]),
            GoogleStreetView: GoogleLinks.getGoogleStreetViewLink(
              data[0],
              data[1]
            ),
            OpenStreetMap: OsmLinks.getOpenStreetMapLink(data[0], data[1], 14),
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
        titleHtml: roundedCoordString + subtitleHtml,
        icon: 'map-marker',
        score: 100, // every coord exists
      }
    };
  }
}
