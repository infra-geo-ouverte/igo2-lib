import { Inject } from '@angular/core';
import { Jsonp, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Message } from '../../core/message';
import { Feature, FeatureType, FeatureFormat} from '../../feature';

import { SEARCH_SOURCE_OPTIONS, SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';


export function ichercheSearchSourcesFactory(jsonp: Jsonp, options: any) {
  return new IChercheSearchSource(jsonp, options);
}

export function provideIChercheSearchSource() {
  return {
    provide: SearchSource,
    useFactory: ichercheSearchSourcesFactory,
    multi: true,
    deps: [Jsonp, SEARCH_SOURCE_OPTIONS]
  };
}

export class IChercheSearchSource extends SearchSource {

  static _name: string = 'ICherche Québec';
  static searchUrl: string = 'https://geoegl.msp.gouv.qc.ca/icherche/geopasdecode';

  constructor(private jsonp: Jsonp,
              @Inject(SEARCH_SOURCE_OPTIONS)
              private options: SearchSourceOptions) {
    super();

    this.options = options ? options : {};
  }

  getName (): string {
    return IChercheSearchSource._name;
  }

  search (term?: string): Observable<Feature[] | Message[]>  {
    const search = this.getSearchParams(term);

    return this.jsonp
      .get(IChercheSearchSource.searchUrl, {search})
      .map(res => this.extractData(res));
  }

  private extractData (response: Response): Feature[] {
    return response.json().features.map(this.formatResult);
  }

  private getSearchParams (term: string): URLSearchParams {
    const limit = options.limit === undefined ? 5 : options.limit;
    const search = new URLSearchParams();
    search.set('q', term);
    search.set('limit', limit);
    search.set('callback', 'JSONP_CALLBACK');
    search.set('geometries', 'geom');

    return search;
  }

  private formatResult (result: any): Feature {
    return {
      id: result._id,
      source: IChercheSearchSource._name,
      type: FeatureType.Feature,
      format: FeatureFormat.GeoJSON,
      title: result.properties.recherche,
      title_html: result.highlight,
      icon: 'place',
      projection: 'EPSG:4326',
      properties: Object.assign({
        type: result.doc_type
      }, result.properties),
      geometry: result.geometry,
      extent: result.bbox
    };
  }

}
