import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { ConfigService } from '@igo2/core';
import { uuid } from '@igo2/utils';
import { map } from 'rxjs/operators';
import {
  Feature,
  FeatureType,
  FeatureFormat,
  SourceFeatureType
} from '../../feature';

import { SearchSource } from './search-source';
import { SearchSourceOptions, PropertiesAlias } from './search-source.interface';


@Injectable()
export class ReseauTransportsQuebecSearchSource extends SearchSource {
  get enabled(): boolean {
    return this.options.enabled !== false;
  }
  set enabled(value: boolean) {
    this.options.enabled = value;
  }

  static _name = 'Réseau routier Transports Québec ';

  private searchUrl = 'https://ws.mapserver.transports.gouv.qc.ca/swtq';
  private locateUrl = 'https://ws.mapserver.transports.gouv.qc.ca/swtq';
  private zoomMaxOnSelect;
  private searchlimit = 5;
  private locatelimit = this.searchlimit * 2;
  private options: SearchSourceOptions;
  private allowedProperties;
  public propertiesAlias =
    [
      { name: 'title', alias: 'Titre' } as PropertiesAlias,
      { name: 'etiquette', alias: 'Informations' } as PropertiesAlias,
      { name: 'nommun', alias: 'Municipalité' } as PropertiesAlias,
      { name: 'messagpan', alias: 'Message' } as PropertiesAlias,
      { name: 'noroute', alias: '# de route' } as PropertiesAlias,
      { name: 'nosortie', alias: '# de sortie' } as PropertiesAlias,
      { name: 'direction', alias: 'Direction' } as PropertiesAlias,
      { name: 'typesort', alias: 'Type de sortie' } as PropertiesAlias
    ];

  private distance = 0.5; // In kilometers
  constructor(private http: HttpClient, private config: ConfigService) {
    super();

    this.options = this.config.getConfig('searchSources.reseautq') || {};
    this.searchUrl = this.options.searchUrl || this.searchUrl;
    this.locateUrl = this.options.locateUrl || this.locateUrl;
    this.searchlimit = this.options.limit || this.searchlimit;
    this.locatelimit = this.options.locateLimit || this.locatelimit;
    this.zoomMaxOnSelect = this.options.zoomMaxOnSelect || this.zoomMaxOnSelect;
    this.propertiesAlias = this.options.propertiesAlias || this.propertiesAlias;
    this.distance = this.options.distance || this.distance; // In kilometers
    this.allowedProperties = [];
    this.propertiesAlias.forEach(allowedProperty => {
      this.allowedProperties.push(allowedProperty.name);
    });
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
    term = term
      .replace(/sortie|repère|kilométrique|auto|routes|route|km| |high|ways|way|roads|road|#|a-|-/gi, '');
    let chainage = '';
    if (term.length === 0) { return of([]); }
    if (term.search(/\+/gi) !== -1) {
      const split_term = term.split(/\+/gi);
      term = split_term[0];
      chainage = split_term[1];
    }

    let searchTerm: any = term;
    if (!isNaN(Number(term))) {
      searchTerm = parseInt(term, 10);
    }

    let repere_filterParams;
    // tslint:disable-next-line:max-line-length
    const simple_filterParams = `FILTER=${'FILTER=<Filter xmlns="http://www.opengis.net/ogc"><PropertyIsEqualTo matchCase="false"><PropertyName>recherche</PropertyName><Literal>' + searchTerm + '</Literal></PropertyIsEqualTo></Filter>'}`;
    // tslint:disable-next-line:max-line-length
    const rtss_filterParams = `FILTER=${'FILTER=<Filter xmlns="http://www.opengis.net/ogc"><PropertyIsEqualTo matchCase="false"><PropertyName>recherche</PropertyName><Literal>' + this.leftPad0(searchTerm, 14) + '</Literal></PropertyIsEqualTo></Filter>'}`;
    // tslint:disable-next-line:max-line-length
    const chainage_filterParams = `rtss=${this.leftPad0(searchTerm, 14).toUpperCase()}&chainage=${Number(chainage)}`;
    // tslint:disable-next-line:max-line-length
    repere_filterParams = `FILTER=${'<Filter xmlns="http://www.opengis.net/ogc"><And><PropertyIsEqualTo matchCase="false"><PropertyName>norte</PropertyName><Literal>' + this.leftPad0(searchTerm, 5) + '</Literal></PropertyIsEqualTo><PropertyIsLike wildCard="*" singleChar="." escapeChar="!" matchCase="false"><PropertyName>affichkm</PropertyName><Literal>km ' + chainage.replace('.', ',') + '</Literal></PropertyIsLike></And></Filter>'}`;
    // tslint:disable-next-line:max-line-length
    const sorties_filterParams = `FILTER=${'<Filter xmlns="http://www.opengis.net/ogc"><Or><PropertyIsEqualTo matchCase="false"><PropertyName>rtssbret</PropertyName><Literal>' + this.leftPad0(searchTerm, 14).toUpperCase() + '</Literal></PropertyIsEqualTo><PropertyIsEqualTo matchCase="false"><PropertyName>rtssrte</PropertyName><Literal>' + this.leftPad0(searchTerm, 14).toUpperCase() + '</Literal></PropertyIsEqualTo><PropertyIsLike wildCard="*" singleChar="." escapeChar="!" matchCase="false"><PropertyName>nosortie</PropertyName><Literal>' + searchTerm + '</Literal></PropertyIsLike></Or></Filter>'}`;

    const callParams = ['REQUEST=GetFeature',
      'SERVICE=WFS',
      'FORMAT=image/png',
      'SLD_VERSION=1.1.0',
      'VERSION=2.0.0',
      'SRSNAME=EPSG:4326',
      'OUTPUTFORMAT=geojson'].join('&');

    const emptyCall = of({ features: [] });

    let a_num_route_call;
    let b_num_tronc_call;
    let c_num_sectn_call;
    let d_num_rts_call;
    let e_rtss_c_call;
    let repere_km_call;
    let sorties_call;

    if (chainage === '') {

      a_num_route_call = this.http.get(
        `${this.searchUrl}?${callParams}&COUNT=${this.searchlimit}&TYPENAMES=a_num_route&${simple_filterParams}`);
      b_num_tronc_call = this.http.get(
        `${this.searchUrl}?${callParams}&COUNT=${this.searchlimit}&TYPENAMES=b_num_tronc&${simple_filterParams}`);
      c_num_sectn_call = this.http.get(
        `${this.searchUrl}?${callParams}&COUNT=${this.searchlimit}&TYPENAMES=c_num_sectn&${simple_filterParams}`);
      d_num_rts_call = this.http.get(
        `${this.searchUrl}?${callParams}&COUNT=${this.searchlimit}&TYPENAMES=d_num_rts&${rtss_filterParams}`);
      e_rtss_c_call = emptyCall;
      repere_km_call = emptyCall;
      sorties_call = this.http.get(
        `${this.searchUrl}?${callParams}&COUNT=${this.searchlimit * 3}&TYPENAMES=sortie_aut&${sorties_filterParams}`);
    } else {
      a_num_route_call = emptyCall;
      b_num_tronc_call = emptyCall;
      c_num_sectn_call = emptyCall;
      d_num_rts_call = emptyCall;
      e_rtss_c_call = this.http.get(
        `${this.searchUrl}?${callParams}&COUNT=${this.searchlimit}&TYPENAMES=e_rtss_c&${chainage_filterParams}`);
      repere_km_call = this.http.get(
        `${this.searchUrl}?${callParams}&COUNT=${this.searchlimit * 3}&TYPENAMES=repere_km&${repere_filterParams}`);
      sorties_call = emptyCall;
    }
    let call_array;
    call_array = [
      a_num_route_call, b_num_tronc_call,
      c_num_sectn_call, d_num_rts_call,
      sorties_call, e_rtss_c_call, repere_km_call];

    const source = forkJoin(call_array)
      .pipe(map(responses => {
        return this.extractSearchData(responses[0])
          .concat(this.extractSearchData(responses[1]))
          .concat(this.extractSearchData(responses[2]))
          .concat(this.extractSearchData(responses[3]))
          .concat(this.extractSearchData(responses[4]))
          .concat(this.extractSearchData(responses[5]))
          .concat(this.extractSearchData(responses[6]))
          ;
      }));
    return source;
  }


  locate(coordinate?: [number, number]): Observable<Feature[]> {

    const threshold = (1 / (111.320 * Math.cos(coordinate[1]))) * this.distance * -1;
    const lat1 = coordinate[1] - threshold;
    const long1 = coordinate[0] - threshold;
    const lat2 = coordinate[1] + threshold;
    const long2 = coordinate[0] + threshold;

    const callParams = ['REQUEST=GetFeature',
      'SERVICE=WFS',
      'FORMAT=image/png',
      'SLD_VERSION=1.1.0',
      'VERSION=2.0.0',
      'SRSNAME=EPSG:4326',
      'OUTPUTFORMAT=geojson',
      `COUNT=${this.locatelimit}`,
      'bbox=' + lat1 + ',' + long1 + ',' + lat2 + ',' + long2 + ',EPSG:4326',
      `TYPENAMES=`].join('&');

    const a_num_route_call = this.http.get(
      `${this.locateUrl}?${callParams}a_num_route`);
    const repere_km_call = this.http.get(
      `${this.searchUrl}?${callParams}repere_km`);
    const sorties_call = this.http.get(
      `${this.searchUrl}?${callParams}sortie_aut`);


    const call_array = [a_num_route_call, sorties_call, repere_km_call];
    const locateSource = forkJoin(call_array)
      .pipe(map(responses => {
        return this.extractSearchData(responses[0])
          .concat(this.extractSearchData(responses[1]))
          .concat(this.extractSearchData(responses[2]))
          ;
      }));

    return locateSource;
  }

  private extractSearchData(response): Feature[] {
    return response.features.map(res => this.formatSearchResult(res, this.zoomMaxOnSelect));
  }

  private formatSearchResult(result: any, zoomMaxOnSelect: number): Feature {
    const properties = Object.assign(
      {
        type: result.type
      },
      result.properties
    );

    let icon = 'timeline';
    let title_html;

    if (properties.hasOwnProperty('title')) {
      title_html = properties.title;
    }
    if (properties.hasOwnProperty('etiquette')) {
      title_html = properties.etiquette;
    }

    if (properties.hasOwnProperty('norte') && properties.hasOwnProperty('affichkm')) {
      properties.title = '# ' + Number(properties.norte) + '+ ' + properties.affichkm;
      title_html = '# ' + Number(properties.norte) + '+ ' + properties.affichkm;

    }
    if (properties.hasOwnProperty('messagpan') && properties.hasOwnProperty('nosortie')) {
      properties.title = `Sortie #${properties.nosortie}`;
      title_html =
        `Sortie #${properties.nosortie} ${properties.direction}`;
      properties.noroute = Number(properties.noroute);
    }

    if (properties.hasOwnProperty('affichkm')
      || properties.hasOwnProperty('nosortie')
      || properties.hasOwnProperty('chainage')) {
      icon = 'place';
    }
    if (properties.hasOwnProperty('nosortie')) {
      icon = 'reply';
    }

    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (this.allowedProperties.indexOf(key) === -1) {
          delete properties[key];
        }
      }
    }

    const shownProperties = {};
    this.allowedProperties.forEach(key => {
      if (properties.hasOwnProperty(key)) {
        const aliasProperty = this.propertiesAlias.filter(f => f.name === key)[0];
        shownProperties[aliasProperty.alias] = properties[key];
      }
    });

    const id = properties.id;
    delete properties.id;
    delete properties.recherche;
    delete properties.type;
    delete properties.coord_x;
    delete properties.coord_y;
    delete properties.cote;
    return {
      id: uuid(),
      source: ReseauTransportsQuebecSearchSource._name,
      sourceType: SourceFeatureType.Search,
      order: 1,
      zoomMaxOnSelect: zoomMaxOnSelect,
      type: FeatureType.Feature,
      format: FeatureFormat.GeoJSON,
      title: properties.title,
      title_html: title_html,
      icon: icon,
      projection: 'EPSG:4326',
      properties: shownProperties,
      geometry: result.geometry,
      extent: result.bbox
    };
  }
}
