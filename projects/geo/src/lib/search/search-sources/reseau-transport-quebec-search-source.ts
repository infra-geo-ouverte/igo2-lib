import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@igo2/core';
import { map } from 'rxjs/operators';
import {
  Feature,
  FeatureType,
  FeatureFormat,
  SourceFeatureType
} from '../../feature';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';


@Injectable()
export class ReseauTransportsQuebecSearchSource extends SearchSource {
  get enabled(): boolean {
    return this.options.enabled !== false;
  }
  set enabled(value: boolean) {
    this.options.enabled = value;
  }

  static _name = 'Réseau routier Transport Québec ';

  private searchUrl = 'https://ws.mapserver.transports.gouv.qc.ca/swtq';
  private locateUrl = 'https://ws.mapserver.transports.gouv.qc.ca/swtq';
  private searchlimit = 5;
  private locatelimit = this.searchlimit * 2;
  private options: SearchSourceOptions;

  constructor(private http: HttpClient, private config: ConfigService) {
    super();

    this.options = this.config.getConfig('searchSources.reseautq') || {};
    this.searchUrl = this.options.searchUrl || this.searchUrl;
    this.locateUrl = this.options.locateUrl || this.locateUrl;
    this.searchlimit = this.options.limit || this.searchlimit;
    this.locatelimit = this.options.locateLimit || this.locatelimit;
  }

  getName(): string {
    return ReseauTransportsQuebecSearchSource._name;
  }

  leftPad0(num: string, size: number): string {
    let s = num + '';
    while (s.length < size) {
      s = '0' + s;
    }
    return s;
}

  search(term?: string): Observable<Feature[]> {
    term = term.replace(/auto|routes|route|km| |high|ways|way|roads|road|#|a-|-/gi, '');
    let chainage = '';

    if (term.search(/\+/gi ) !== -1) {
      const split_term = term.split(/\+/gi);
      term = split_term[0];
      chainage = split_term[1];
    }

    let nb_char = term.length;
    let searchTerm: any = term;
    if (!isNaN(Number(term))) {
      searchTerm = parseInt(term, 10);
      nb_char = String(searchTerm).length;
    }

    let typename = '';
    let filterParams;

    if (searchTerm === 0) {
      typename = 'a_num_route';
      // tslint:disable-next-line:max-line-length
      filterParams = `FILTER=${'FILTER=<Filter xmlns="http://www.opengis.net/ogc"><PropertyIsEqualTo matchCase="false"><PropertyName>recherche</PropertyName><Literal>' + searchTerm + '</Literal></PropertyIsEqualTo></Filter>'}`;
    }

    if (((nb_char >= 2 && nb_char <= 5) || searchTerm === 5) && chainage === '') {
      typename = 'a_num_route';
      // tslint:disable-next-line:max-line-length
      filterParams = `FILTER=${'FILTER=<Filter xmlns="http://www.opengis.net/ogc"><PropertyIsEqualTo matchCase="false"><PropertyName>recherche</PropertyName><Literal>' + searchTerm + '</Literal></PropertyIsEqualTo></Filter>'}`;
    }
    if (((nb_char >= 2 && nb_char <= 5) || searchTerm === 5) && chainage !== '') {
      typename = 'repere_km';
      searchTerm = this.leftPad0(searchTerm, 5);
      // tslint:disable-next-line:max-line-length
      filterParams = `FILTER=${'<Filter xmlns="http://www.opengis.net/ogc"><And><PropertyIsEqualTo matchCase="false"><PropertyName>norte</PropertyName><Literal>' + searchTerm + '</Literal></PropertyIsEqualTo><PropertyIsLike wildCard="*" singleChar="." escapeChar="!" matchCase="false"><PropertyName>affichkm</PropertyName><Literal>km ' + chainage.replace('.', ',') + '</Literal></PropertyIsLike></And></Filter>'}`;
          }
    if (nb_char >= 4 && nb_char <= 7 && chainage === '') {
      typename = 'b_num_tronc';
      // tslint:disable-next-line:max-line-length
      filterParams = `FILTER=${'FILTER=<Filter xmlns="http://www.opengis.net/ogc"><PropertyIsEqualTo matchCase="false"><PropertyName>recherche</PropertyName><Literal>' + searchTerm + '</Literal></PropertyIsEqualTo></Filter>'}`;
    }
    if (nb_char >= 7 && nb_char <= 10 && chainage === '') {
      typename = 'c_num_sectn';
      // tslint:disable-next-line:max-line-length
      filterParams = `FILTER=${'FILTER=<Filter xmlns="http://www.opengis.net/ogc"><PropertyIsEqualTo matchCase="false"><PropertyName>recherche</PropertyName><Literal>' + searchTerm + '</Literal></PropertyIsEqualTo></Filter>'}`;

    }
    if (nb_char >= 11 && nb_char <= 14 && chainage === '') {
      typename = 'd_num_rts';
      searchTerm =  this.leftPad0(searchTerm, 14).toUpperCase();
      // tslint:disable-next-line:max-line-length
      filterParams = `FILTER=${'FILTER=<Filter xmlns="http://www.opengis.net/ogc"><PropertyIsEqualTo matchCase="false"><PropertyName>recherche</PropertyName><Literal>' + searchTerm + '</Literal></PropertyIsEqualTo></Filter>'}`;
      }

  if (nb_char >= 11 && nb_char <= 25 && chainage !== '') {
      typename = 'e_rtss_c';
      searchTerm =  this.leftPad0(searchTerm, 14).toUpperCase();
      filterParams =   `rtss=${searchTerm}&chainage=${Number(chainage)}`;
    }

    const params = [
      'REQUEST=GetFeature',
      'SERVICE=WFS',
      'FORMAT=image/png',
      'SLD_VERSION=1.1.0',
      'VERSION=2.0.0',
      'SRSNAME=EPSG:4326',
      'OUTPUTFORMAT=geojson',
      `COUNT=${this.searchlimit}`,
      `TYPENAMES=${typename}`,
      filterParams
        ];

    if (typename === '') {
      return;
    }

    return this.http
      .get(`${this.searchUrl}?${params.join('&')}`)
      .pipe(map(res => this.extractSearchData(res)));
  }

  locate(coordinate?: [number, number]): Observable<Feature[]>  {
    const threshold = 0.008333333 / 2;
    const lat1 = coordinate[1] - threshold;
    const long1 = coordinate[0] - threshold;
    const lat2 = coordinate[1] + threshold;
    const long2 = coordinate[0] + threshold;

    const params = [
      'REQUEST=GetFeature',
      'SERVICE=WFS',
      'FORMAT=image/png',
      'VERSION=2.0.0',
      'SRSNAME=EPSG:4326',
      'OUTPUTFORMAT=geojson',
      `COUNT=${this.locatelimit}`,
      `TYPENAMES=a_num_route`,
      'bbox=' + lat1 + ',' + long1 + ',' + lat2 + ',' + long2 + ',EPSG:4326'

        ];

    return this.http
    .get(`${this.locateUrl}?${params.join('&')}`)
    .pipe(map(res => this.extractSearchData(res)));
}

  private extractSearchData(response): Feature[] {
    return response.features.map(this.formatSearchResult);
  }

  private formatSearchResult(result: any): Feature {
    const properties = Object.assign(
      {
        type: result.type
      },
      result.properties
    );

    const allowedProperties = ['title', 'etiquette', 'nommun'];

    if (properties.hasOwnProperty('norte') && properties.hasOwnProperty('affichkm')) {
      properties.title = '# ' + Number(properties.norte) + '+' + properties.affichkm;

    }

   for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
            if (allowedProperties.indexOf(key) === -1) {
              delete properties[key];
            }
        }
    }

    const id = properties.id;
    delete properties.id;
    delete properties.recherche;
    delete properties.type;
    delete properties.coord_x;
    delete properties.coord_y;
    delete properties.cote;
    return {
      id: id,
      source: ReseauTransportsQuebecSearchSource._name,
      sourceType: SourceFeatureType.Search,
      order: 1,
      type: FeatureType.Feature,
      format: FeatureFormat.GeoJSON,
      title: properties.title,
      title_html: properties.etiquette,
      icon: 'timeline',
      projection: 'EPSG:4326',
      properties: properties,
      geometry: result.geometry,
      extent: result.bbox
    };
  }
}
