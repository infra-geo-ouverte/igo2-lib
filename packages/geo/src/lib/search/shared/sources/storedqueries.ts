import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';

import { ObjectUtils } from '@igo2/utils';

import { FEATURE, Feature } from '../../../feature';

import { SearchResult } from '../search.interfaces';
import { SearchSource, TextSearch, ReverseSearch } from './source';
import {
  SearchSourceOptions,
  TextSearchOptions,
  ReverseSearchOptions
} from './source.interfaces';
import {
  StoredQueriesData,
  StoredQueriesResponse,
  StoredQueriesReverseData,
  StoredQueriesReverseResponse,
  StoredQueriesSearchSourceOptions,
  StoredQueriesFields
} from './storedqueries.interfaces';

import * as olformat from 'ol/format';

/**
 * StoredQueries search source
 */
@Injectable()
export class StoredQueriesSearchSource extends SearchSource implements TextSearch {
  static id = 'storedqueries';
  static type = FEATURE;
  static propertiesBlacklist: string[] = [
    '@timestamp',
    '@version',
    'recherche',
    'id',
    'idrte',
    'cote',
    'geometry',
    'bbox'
  ];
  public storedQueriesOptions: StoredQueriesSearchSourceOptions;
  public multipleFieldQuery: boolean;

  constructor(
    private http: HttpClient,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options);
    this.storedQueriesOptions = options as StoredQueriesSearchSourceOptions ;
    if (!this.storedQueriesOptions.storedquery_id) {
      const err = 'Stored Queries :You have to set "storedquery_id" into StoredQueries options. ex: storedquery_id: "nameofstoredquerie"';
      throw new Error(err);
    }
    if (!this.storedQueriesOptions.fields) {
      throw new Error('Stored Queries :You have to set "fields" into StoredQueries options. ex: fields: ["a","b"]');
    }

    this.storedQueriesOptions.outputformat = this.storedQueriesOptions.outputformat || 'text/xml; subtype=gml/3.1.1';
    this.storedQueriesOptions.srsname = this.storedQueriesOptions.srsname || 'EPSG:4326';

    if (!this.storedQueriesOptions.fields) {
      throw new Error('Stored Queries :You must set a fields definition for your stored query');
    }

    if (!(this.storedQueriesOptions.fields instanceof Array)) {
      this.storedQueriesOptions.fields = [this.storedQueriesOptions.fields];
    }

    this.multipleFieldQuery  = this.storedQueriesOptions.fields.length > 1 ? true : false;

    const firstField = this.storedQueriesOptions.fields[0];

    this.storedQueriesOptions.fields.forEach(field => {
      if (field === firstField) {
        field.firstField = true;
      } else {
        field.firstField = false;
      }
      if (this.multipleFieldQuery && !field.splitPrefix && !field.firstField) {
        throw new Error('Stored Queries :You must set a field spliter into your field definition (except for the last one!)');
      }
      if (!field.defaultValue) {
        throw new Error('Stored Queries :You must set a field default value into your field definition');
      }

    });
  }

  getId(): string {
    return StoredQueriesSearchSource.id;
  }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'Stored Queries',
      searchUrl: '/tqu/dev/pelord/swtq'
    };
  }

  /**
   * Search a location by name or keyword
   * @param term Location name or keyword
   * @returns Observable of <SearchResult<Feature>[]
   */
  search(
    term: string,
    options?: TextSearchOptions
  ): Observable<SearchResult<Feature>[]> {
    const storedqueriesParams = this.termSplitter(term, this.storedQueriesOptions.fields );
    const params = this.computeRequestParams(options || {}, storedqueriesParams);
    return this.http
      .get(this.searchUrl, { params, responseType: 'text' })
      .pipe(map((response) => {
        return this.extractResults(this.extractWFSData(response));
      }));
  }

  private extractWFSData(res) {
    const wfs = olformat.WFS;
    const geojson = olformat.GeoJSON;
    const wfsfeatures = new wfs().readFeatures(res);
    const features = JSON.parse(new geojson().writeFeatures(wfsfeatures));
    return features;
  }

  private termSplitter(term: string, fields: StoredQueriesFields[]): {} {
    const splittedTerm = {};
    let strRegex = '';
    // Used to build the default values
    fields.forEach(field => {
      splittedTerm[field.name] = field.defaultValue;
      if (!field.firstField) {
        strRegex += `(.*)${field.splitPrefix}`;
      }
    });
    const regex = new RegExp(`${strRegex}(.*)`, 'gm');
    const m = regex.exec(term);
    if (!m) {
      splittedTerm[fields[0].name] = term;
    } else {
      m.shift();
      fields.forEach((field, index) => {
        splittedTerm[field.name] = m[index] !== '' ? m[index] : field.defaultValue;
      });
    }
    console.log(splittedTerm);
    return splittedTerm;
  }

  private computeRequestParams(options: TextSearchOptions, queryParams): HttpParams {
    return new HttpParams({
      fromObject: Object.assign(
        {
          service: 'wfs',
          version: '1.1.0',
          request: 'GetFeature',
          storedquery_id: this.storedQueriesOptions.storedquery_id,
          srsname: this.storedQueriesOptions.srsname,
          outputformat: this.storedQueriesOptions.outputformat
        },
        queryParams,
        this.params,
        options.params || {}
      )
    });
  }

  private extractResults(response: StoredQueriesResponse): SearchResult<Feature>[] {
    return response.features.map((data: StoredQueriesData) => {
      return this.dataToResult(data);
    });
  }

  private dataToResult(data: StoredQueriesData): SearchResult<Feature> {
    const properties = this.computeProperties(data);
    const id = [this.getId(), properties.type, data.id].join('.');
    return {
      source: this,
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry: data.geometry,
        // extent: data.bbox,
        properties,
        meta: {
          id,
          title: data.properties.recherche
        }
      },
      meta: {
        dataType: FEATURE,
        id,
        title: data.properties.recherche,
        titleHtml: data.properties.title || data.properties.messagpan,
        icon: 'place'
      }
    };
  }

  private computeProperties(data: StoredQueriesData): { [key: string]: any } {
    const properties = ObjectUtils.removeKeys(
      data.properties,
      StoredQueriesSearchSource.propertiesBlacklist
    );
    return properties;
  }
}

/**
 * StoredQueriesReverse search source
 */
/*
@Injectable()
export class StoredQueriesReverseSearchSource extends SearchSource
  implements ReverseSearch {
  static id = 'storedqueriesreverse';
  static type = FEATURE;
  static propertiesBlacklist: string[] = ['doc_type'];

  constructor(
    private http: HttpClient,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options);
  }

  getId(): string {
    return StoredQueriesReverseSearchSource.id;
  }

  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'Stored Queries',
      searchUrl: '/tqu/dev/pelord/swtq'
    };
  }
*/
  /**
   * Search a location by coordinates
   * @param lonLat Location coordinates
   * @param distance Search raidus around lonLat
   * @returns Observable of <SearchResult<Feature>[]
   *//*
  reverseSearch(
    lonLat: [number, number],
    options?: ReverseSearchOptions
  ): Observable<SearchResult<Feature>[]> {
    const params = this.computeRequestParams(lonLat, options || {});
    return this.http.get(this.searchUrl, { params }).pipe(
      map((response: StoredQueriesReverseResponse) => {
        return this.extractResults(response);
      })
    );
  }

  private computeRequestParams(
    lonLat: [number, number],
    options?: ReverseSearchOptions
  ): HttpParams {
    const distance = options.distance;
    return new HttpParams({
      fromObject: Object.assign(
        {
          service: 'wfs',
          version: '2.0.0',
          request: 'GetFeature',

           // &STOREDQUERY_ID=rtss&SRSNAME=epsg:4326&rtss=0002004080000D&chainage=0
           // END
        },
        this.params,
        options.params || {}
      )
    });
  }

  private extractResults(
    response: StoredQueriesReverseResponse
  ): SearchResult<Feature>[] {
    return response.features.map((data: StoredQueriesReverseData) => {
      return this.dataToResult(data);
    });
  }

  private dataToResult(data: StoredQueriesReverseData): SearchResult<Feature> {
    const properties = this.computeProperties(data);
    const extent = this.computeExtent(data);
    const id = [this.getId(), properties.type, data._id].join('.');

    return {
      source: this,
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry: data.geometry,
        extent,
        properties,
        meta: {
          id,
          title: data.properties.nom
        }
      },
      meta: {
        dataType: FEATURE,
        id,
        title: data.properties.nom,
        icon: 'place'
      }
    };
  }

  private computeProperties(data: StoredQueriesReverseData): { [key: string]: any } {
    const properties = ObjectUtils.removeKeys(
      data.properties,
      StoredQueriesReverseSearchSource.propertiesBlacklist
    );
    return Object.assign(properties, { type: data.properties.doc_type });
  }

  private computeExtent(
    data: StoredQueriesReverseData
  ): [number, number, number, number] {
    return [data.bbox[0], data.bbox[2], data.bbox[1], data.bbox[3]];
  }
}
*/
