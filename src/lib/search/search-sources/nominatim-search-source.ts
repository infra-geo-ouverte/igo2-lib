import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ConfigService, Message } from '../../core';
import {
  Feature,
  FeatureType,
  FeatureFormat,
  SourceFeatureType
} from '../../feature';

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

  static _name: string = 'Nominatim (OSM)';
  static sortIndex: number = 10;

  private searchUrl: string = 'https://nominatim.openstreetmap.org/search';
  private locateUrl: string = 'https://nominatim.openstreetmap.org/reverse';
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

  search(term?: string): Observable<Feature[] | Message[]> {
    const searchParams = this.getSearchParams(term);

    return this.http
      .get(this.searchUrl, { params: searchParams })
      .map(res => this.extractData(res));
  }

  locate(
    coordinate: [number, number],
    zoom: number
  ): Observable<Feature[] | Message[]> {
    const locateParams = this.getLocateParams(coordinate, zoom);
    return this.http
      .get(this.locateUrl, { params: locateParams })
      .map(res => this.extractData([res]));
  }

  private extractData(response): Feature[] {
    return response.map(this.formatResult);
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
        zoom: String(18),
        polygon_geojson: String(1)
      }
    });
  }

  private formatResult(result: any): Feature {
    return {
      id: result.place_id,
      source: NominatimSearchSource._name,
      sourceType: SourceFeatureType.Search,
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
