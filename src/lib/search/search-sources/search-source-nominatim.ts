import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Message } from '../../core/message';
import { Feature, FeatureType, FeatureFormat} from '../../feature';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source-options';


export class SearchSourceNominatim extends SearchSource {

  static _name: string = 'Nominatim (OSM)';
  static sortIndex: number = 10;
  static searchUrl: string = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: Http, private options: SearchSourceOptions = {}) {
    super();
  }

  getName (): string {
    return SearchSourceNominatim._name;
  }

  search (term?: string): Observable<Feature[] | Message[]>  {
    const search = this.getSearchParams(term);

    return this.http
      .get(SearchSourceNominatim.searchUrl, { search })
      .map(res => this.extractData(res));
  }

  private extractData (response: Response): Feature[] {
    return response.json().map(this.formatResult);
  }

  private getSearchParams (term: string): URLSearchParams {
    const search = new URLSearchParams();
    const limit = this.options.limit || 2;

    search.set('q', term);
    search.set('format', 'json');
    search.set('limit', String(limit));

    return search;
  }

  private formatResult (result: any): Feature {
    return {
      id: result.place_id,
      source: SearchSourceNominatim._name,
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
