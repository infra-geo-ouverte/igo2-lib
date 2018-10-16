import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
export class IChercheSearchSource extends SearchSource {
  get enabled(): boolean {
    return this.options.enabled !== false;
  }
  set enabled(value: boolean) {
    this.options.enabled = value;
  }

  static _name = 'ICherche Québec';

  private searchUrl = 'https://geoegl.msp.gouv.qc.ca/icherche/geocode';
  private locateUrl = 'https://geoegl.msp.gouv.qc.ca/icherche/xy';
  private zoomMaxOnSelect;
  private options: SearchSourceOptions;

  constructor(private http: HttpClient, private config: ConfigService) {
    super();

    this.options = this.config.getConfig('searchSources.icherche') || {};
    this.searchUrl = this.options.searchUrl || this.searchUrl;
    this.locateUrl = this.options.locateUrl || this.locateUrl;
    this.zoomMaxOnSelect = this.options.zoomMaxOnSelect || this.zoomMaxOnSelect;
  }

  getName(): string {
    return IChercheSearchSource._name;
  }

  search(term?: string): Observable<Feature[]> {
    const searchParams = this.getSearchParams(term);

    return this.http
      .get(this.searchUrl, { params: searchParams })
      .pipe(map(res => this.extractSearchData(res)));
  }

  locate(coordinate: [number, number], zoom: number): Observable<Feature[]> {
    const locateParams = this.getLocateParams(coordinate, zoom);
    if (
      coordinate[0] > -81 &&
      coordinate[0] < -55 &&
      coordinate[1] >= 43.1 &&
      coordinate[1] < 64
    ) {
      return this.http.get(this.locateUrl, { params: locateParams }).pipe(
        map(res => this.extractLocateData(res)),
        catchError(error => {
          error.error.toDisplay = true;
          error.error.title = this.getName();
          error.error.message = error.error.message_erreur;
          return throwError(error);
        })
      );
    }
  }

  private extractSearchData(response): Feature[] {
    return response.features.map(res => this.formatSearchResult(res, this.zoomMaxOnSelect));
  }

  private extractLocateData(response): Feature[] {
    return response.features.map(res => this.formatLocateResult(res, this.zoomMaxOnSelect));
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

  private formatSearchResult(result: any, zoomMaxOnSelect: number): Feature {
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
      zoomMaxOnSelect: zoomMaxOnSelect,
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

  private formatLocateResult(result: any, zoomMaxOnSelect: number): Feature {
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
      zoomMaxOnSelect: zoomMaxOnSelect,
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
