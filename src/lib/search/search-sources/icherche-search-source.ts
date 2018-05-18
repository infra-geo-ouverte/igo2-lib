import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators/catchError';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { ConfigService } from '../../core';
import {
  Feature,
  FeatureType,
  FeatureFormat,
  SourceFeatureType
} from '../../feature';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';

@Injectable()
export class IChercheSearchSource extends SearchSource {
  get enabled(): boolean {
    return this.options.enabled !== false;
  }
  set enabled(value: boolean) {
    this.options.enabled = value;
  }

  static _name: string = 'ICherche Québec';

  private searchUrl: string = 'https://geoegl.msp.gouv.qc.ca/icherche/geocode';
  private locateUrl: string = 'https://geoegl.msp.gouv.qc.ca/icherche/xy';
  private options: SearchSourceOptions;

  constructor(private http: HttpClient, private config: ConfigService) {
    super();

    this.options = this.config.getConfig('searchSources.icherche') || {};
    this.searchUrl = this.options.url || this.searchUrl;
    this.locateUrl = this.options.locateUrl || this.locateUrl;
  }

  getName(): string {
    return IChercheSearchSource._name;
  }

  search(term?: string): Observable<Feature[]> {
    const searchParams = this.getSearchParams(term);

    return this.http
      .get(this.searchUrl, { params: searchParams })
      .map(res => this.extractSearchData(res));
  }

  locate(
    coordinate: [number, number],
    zoom: number
  ): Observable<Feature[]> {
    const locateParams = this.getLocateParams(coordinate, zoom);
    if (
      coordinate[0] > -81 &&
      coordinate[0] < -55 &&
      coordinate[1] >= 43.1 &&
      coordinate[1] < 64
    ) {
      return this.http
        .get(this.locateUrl, { params: locateParams })
        .map(res => this.extractLocateData(res))
        .pipe(
          catchError(error => {
            error.error.toDisplay = true;
            error.error.title = this.getName();
            error.error.message = error.error.message_erreur;
            return new ErrorObservable(error);
          })
        );
    }
  }

  private extractSearchData(response): Feature[] {
    return response.features.map(this.formatSearchResult);
  }

  private extractLocateData(response): Feature[] {
    return response.features.map(this.formatLocateResult);
  }

  private getSearchParams(term: string): HttpParams {
    const limit = this.options.limit === undefined ? 5 : this.options.limit;
    const type =
      this.options.type ||
      'adresse,code_postal,route,municipalite,mrc,region_administrative';

    return new HttpParams({
      fromObject: {
        q: term,
        type: type,
        limit: String(limit),
        geometries: 'geom'
      }
    });
  }

  private getLocateParams(
    coordinate: [number, number],
    currentZoom: number
  ): HttpParams {
    let distance = 100;
    const type = this.options.type || 'adresse,municipalite,mrc,regadmin';
    if (currentZoom >= 16) {
      distance = 30;
    } else if (currentZoom < 8) {
      distance = 500;
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

  private formatSearchResult(result: any): Feature {
    const properties = Object.assign(
      {
        type: result.doc_type
      },
      result.properties
    );
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

  private formatLocateResult(result: any): Feature {
    const properties = Object.assign(
      {
        type: result.properties.doc_type
      },
      result.properties
    );
    delete properties.doc_type;
    return {
      id: result._id,
      source: IChercheSearchSource._name,
      sourceType: SourceFeatureType.LocateXY,
      order: 1,
      type: FeatureType.Feature,
      format: FeatureFormat.GeoJSON,
      title: result.properties.nom,
      title_html: result.properties.nom,
      icon: 'place',
      projection: 'EPSG:4326',
      properties: properties,
      geometry: result.geometry,
      extent: [
        parseFloat(result.bbox[0]),
        parseFloat(result.bbox[2]),
        parseFloat(result.bbox[1]),
        parseFloat(result.bbox[3])
      ]
    };
  }
}
