import { Injectable } from '@angular/core';
import { Jsonp, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ConfigService, Message } from '../../core';
import { Feature, FeatureType, FeatureFormat} from '../../feature';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';


@Injectable()
export class IChercheSearchSource extends SearchSource {

  get enabled(): boolean { return this.options.enabled !== false; }
  set enabled(value: boolean) { this.options.enabled = value; }

  static _name: string = 'ICherche Québec';

  private searchUrl: string = 'https://geoegl.msp.gouv.qc.ca/icherche/geopasdecode';
  private options: SearchSourceOptions;

  constructor(private jsonp: Jsonp,
              private config: ConfigService) {
    super();

    this.options = this.config.getConfig('searchSources.icherche') || {};
    this.searchUrl = this.options.url || this.searchUrl;
  }

  getName(): string {
    return IChercheSearchSource._name;
  }

  search(term?: string): Observable<Feature[] | Message[]>  {
    const search = this.getSearchParams(term);

    return this.jsonp
      .get(this.searchUrl, {search})
      .map(res => this.extractData(res));
  }

  private extractData(response: Response): Feature[] {
    return response.json().features.map(this.formatResult);
  }

  private getSearchParams(term: string): URLSearchParams {
    const search = new URLSearchParams();
    const limit = this.options.limit === undefined ? 5 : this.options.limit;

    search.set('q', term);
    search.set('limit', String(limit));
    search.set('callback', 'JSONP_CALLBACK');
    search.set('geometries', 'geom');

    return search;
  }

  private formatResult(result: any): Feature {
    const properties = Object.assign({
      type: result.doc_type
    }, result.properties);
    delete properties['@timestamp'];
    delete properties['@version'];
    delete properties.recherche;
    delete properties.id;
    delete properties.cote;

    return {
      id: result._id,
      source: IChercheSearchSource._name,
      type: FeatureType.Feature,
      format: FeatureFormat.GeoJSON,
      title: result.properties.recherche,
      title_html: result.highlight,
      icon: 'place',
      projection: 'EPSG:4326',
      properties: properties,
      geometry: result.geometry,
      extent: result.bbox
    };
  }

}
