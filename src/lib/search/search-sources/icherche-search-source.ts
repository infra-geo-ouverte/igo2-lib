import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { ConfigService, Message } from '../../core';
import { Feature, FeatureType, FeatureFormat, SourceFeatureType} from '../../feature';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';


@Injectable()
export class IChercheSearchSource extends SearchSource {

  get enabled(): boolean { return this.options.enabled !== false; }
  set enabled(value: boolean) { this.options.enabled = value; }

  static _name: string = 'ICherche Québec';

  private searchUrl: string = 'https://geoegl.msp.gouv.qc.ca/icherche/geocode';
  private locateUrl: string = 'https://geoegl.msp.gouv.qc.ca/icherche/xy'
  private options: SearchSourceOptions;

  constructor(private http: HttpClient,
              private config: ConfigService) {
    super();

    this.options = this.config.getConfig('searchSources.icherche') || {};
    this.searchUrl = this.options.url || this.searchUrl;
    this.locateUrl = this.options.locateUrl || this.locateUrl;
  }

  getName(): string {
    return IChercheSearchSource._name;
  }

  search(term?: string): Observable<Feature[] | Message[]>  {
    const searchParams = this.getSearchParams(term);

    return this.http
      .get(this.searchUrl, {params: searchParams})
      .map(res => this.extractData(res));
  }

  locate(coordinate: [number, number], zoom: number): Observable<Feature[] | Message[]>  {
    const locateParams = this.getLocateParams(coordinate, zoom);
    return this.http.get(this.locateUrl, {params: locateParams}).map(res => this.extractData(res));
  }  

  private extractData(response): Feature[] {
    return response.features.map(this.formatResult);
  }

  private getSearchParams(term: string): HttpParams {
    const limit = this.options.limit === undefined ? 5 : this.options.limit;
    const type = this.options.type ||
      'adresse,code_postal,route,municipalite,mrc,region_administrative'

    return new HttpParams({
      fromObject: {
        q: term,
        type: type,
        limit: String(limit),
        geometries: 'geom'
      }
    });
  }

  private getLocateParams(coordinate: [number, number], currentZoom: number): HttpParams {
    let distance = 100;
    const type = this.options.type || 'adresse'
    if (currentZoom >= 16) {
      distance = 30
    } else if (currentZoom < 8) {
      distance = 500
    }
    return new HttpParams({
      fromObject: {
        loc: coordinate.join(','),
        type: type,
        distance: String(distance),
        geometries: 'geom'
      }
    });
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
      sourceType: SourceFeatureType.Search,
      order: 1,
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
