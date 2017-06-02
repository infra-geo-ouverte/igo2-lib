import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ConfigService, Message } from '../../core';
import { Feature, FeatureType, FeatureFormat} from '../../feature';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';


@Injectable()
export class NominatimSearchSource extends SearchSource {

  get enabled(): boolean { return this.options.enabled !== false; }
  set enabled(value: boolean) { this.options.enabled = value; }

  static _name: string = 'Nominatim (OSM)';
  static sortIndex: number = 10;

  private searchUrl: string = 'https://nominatim.openstreetmap.org/search';
  private options: SearchSourceOptions;

  constructor(private http: Http,
              private config: ConfigService) {
    super();

    this.options = this.config.getConfig('searchSources.nominatim') || {};
    this.searchUrl = this.options.url || this.searchUrl;
  }

  getName(): string {
    return NominatimSearchSource._name;
  }

  search(term?: string): Observable<Feature[] | Message[]>  {
    const search = this.getSearchParams(term);

    return this.http
      .get(this.searchUrl, { search })
      .map(res => this.extractData(res));
  }

  private extractData(response: Response): Feature[] {
    return response.json().map(this.formatResult);
  }

  private getSearchParams(term: string): URLSearchParams {
    const search = new URLSearchParams();
    const limit = this.options.limit === undefined ? 5 : this.options.limit;

    search.set('q', term);
    search.set('format', 'json');
    search.set('limit', String(limit));

    return search;
  }

  private formatResult(result: any): Feature {
    return {
      id: result.place_id,
      source: NominatimSearchSource._name,
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
        coordinates: [
          parseFloat(result.lon),
          parseFloat(result.lat)
        ]
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
