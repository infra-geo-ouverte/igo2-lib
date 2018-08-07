import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from '@igo2/core';
import { Feature } from '../../feature/shared/feature.interface';
import {
  FeatureType,
  FeatureFormat,
  SourceFeatureType
} from '../../feature/shared/feature.enum';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';

@Injectable()
export class NominatimSearchSource extends SearchSource {
  get enabled(): boolean {
    return this.options.enabled !== false;
  }
  set enabled(value: boolean) {
    this.options.enabled = value;
  }

  static _name = 'Nominatim (OSM)';
  static sortIndex = 10;

  private searchUrl = 'https://nominatim.openstreetmap.org/search';
  private locateUrl = 'https://nominatim.openstreetmap.org/reverse';
  private options: SearchSourceOptions;

  constructor(private http: HttpClient, private config: ConfigService) {
    super();

    this.options = this.config.getConfig('searchSources.nominatim') || {};
    this.searchUrl = this.options.url || this.searchUrl;
    this.locateUrl = this.options.locateUrl || this.locateUrl;
  }

  getName(): string {
    return NominatimSearchSource._name;
  }

  search(term?: string): Observable<Feature[]> {
    const searchParams = this.getSearchParams(term);

    return this.http
      .get(this.searchUrl, { params: searchParams })
      .pipe(map(res => this.extractData(res, SourceFeatureType.Search)));
  }

  locate(coordinate: [number, number], zoom: number): Observable<Feature[]> {
    const locateParams = this.getLocateParams(coordinate, zoom);
    return this.http
      .get(this.locateUrl, { params: locateParams })
      .pipe(map(res => this.extractData([res], SourceFeatureType.LocateXY)));
  }

  private extractData(response, resultType): Feature[] {
    if (response[0] && response[0].error) {
      return [];
    }
    return response.map(res => this.formatResult(res, resultType));
  }

  private getSearchParams(term: string): HttpParams {
    const limit = this.options.limit === undefined ? 5 : this.options.limit;

    return new HttpParams({
      fromObject: {
        q: term,
        format: 'json',
        limit: String(limit)
      }
    });
  }

  private getLocateParams(
    coordinate: [number, number],
    zoom: number
  ): HttpParams {
    return new HttpParams({
      fromObject: {
        lat: String(coordinate[1]),
        lon: String(coordinate[0]),
        format: 'json',
        zoom: String(zoom),
        polygon_geojson: String(1)
      }
    });
  }

  private formatResult(result: any, resultType): Feature {
    return {
      id: result.place_id,
      source: NominatimSearchSource._name,
      sourceType: resultType,
      order: 0,
      type: FeatureType.Feature,
      format: FeatureFormat.GeoJSON,
      title: result.display_name,
      icon: 'place',
      projection: 'EPSG:4326',
      properties: {
        name: result.display_name,
        place_id: result.place_id,
        osm_type: result.osm_type,
        class: result.class,
        type: result.type
      },
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(result.lon), parseFloat(result.lat)]
      },
      extent: [
        parseFloat(result.boundingbox[2]),
        parseFloat(result.boundingbox[0]),
        parseFloat(result.boundingbox[3]),
        parseFloat(result.boundingbox[1])
      ]
    };
  }
}
