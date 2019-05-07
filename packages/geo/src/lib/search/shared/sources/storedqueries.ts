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
  public multipleFieldsQuery: boolean;

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

    const storedQueryId = this.storedQueriesOptions.storedquery_id.toLowerCase();
    if (storedQueryId.includes('getfeaturebyid') && this.storedQueriesOptions.outputformat.toLowerCase().includes('getfeaturebyid') ) {
      let err = 'You must set a geojson format for your stored query. This is due to an openlayers issue)';
      err += ' (wfs 1.1.0 & gml 3.1.1 limitation)';
      throw new Error(err);
    }

    if (!this.storedQueriesOptions.fields) {
      throw new Error('Stored Queries :You must set a fields definition for your stored query');
    }

    if (!(this.storedQueriesOptions.fields instanceof Array)) {
      this.storedQueriesOptions.fields = [this.storedQueriesOptions.fields];
    }

    this.multipleFieldsQuery  = this.storedQueriesOptions.fields.length > 1 ? true : false;

    this.storedQueriesOptions.fields.forEach((field, index) => {
      if (this.multipleFieldsQuery && !field.splitPrefix && index !== 0) {
        throw new Error('Stored Queries :You must set a field spliter into your field definition (optional for the first one!)');
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
      searchUrl: 'https://ws.mapserver.transports.gouv.qc.ca/swtq'
    };
  }

  // URL CALL EXAMPLES:
  //  GetFeatureById (mandatory storedquery for wfs server) (outputformat must be in geojson)
  //  tslint:disable-next-line:max-line-length
  //  https://ws.mapserver.transports.gouv.qc.ca/swtq?service=wfs&version=2.0.0&request=GetFeature&storedquery_id=urn:ogc:def:query:OGC-WFS::GetFeatureById&srsname=epsg:4326&outputformat=geojson&ID=a_num_route.132
  //  Custom StoredQuery
  //  tslint:disable-next-line:max-line-length
  //  https://ws.mapserver.transports.gouv.qc.ca/swtq?service=wfs&version=1.1.0&request=GetFeature&storedquery_id=rtss&srsname=epsg:4326&outputformat=text/xml;%20subtype=gml/3.1.1&rtss=0013801110000c&chainage=12

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

    if (
      new RegExp('.*?gml.*?', 'i').test(this.storedQueriesOptions.outputformat)
    ) {
      return this.http
      .get(this.searchUrl, { params, responseType: 'text' })
      .pipe(map((response) => {
        return this.extractResults(this.extractWFSData(response));
      }));
    } else {
      return this.http
      .get(this.searchUrl, { params })
      .pipe(map((response) => {
        return this.extractResults(this.extractWFSData(response));
      }));
    }
  }

  private getFormatFromOptions() {
    let olFormatCls;

    const outputFormat = this.storedQueriesOptions.outputformat;
    const patternGml3 = new RegExp('.*?gml.*?', 'i');
    const patternGeojson = new RegExp('.*?json.*?', 'i');

    if (patternGeojson.test(outputFormat)) {
      olFormatCls = olformat.GeoJSON;
    }
    if (patternGml3.test(outputFormat)) {
      olFormatCls = olformat.WFS;
    }

    return new olFormatCls();
  }

  private extractWFSData(res) {
    const olFormat = this.getFormatFromOptions();
    const wfs = olformat.WFS;
    const geojson = olformat.GeoJSON;
    const wfsfeatures = olFormat.readFeatures(res);
    const features = JSON.parse(new geojson().writeFeatures(wfsfeatures));
    return features;
  }

  private termSplitter(term: string, fields: StoredQueriesFields[]): {} {
    const splittedTerm = {};
    let remainingTerm = term;
    let cnt = 0;

    // Used to build the default values
    fields.forEach(field => {
      splittedTerm[field.name] = field.defaultValue;
      const splitterRegex = new RegExp(field.splitPrefix + '(.+)', 'i');
      if (splitterRegex.test(remainingTerm)) {
        cnt = field.splitPrefix ? cnt += 1 : cnt;
        remainingTerm = remainingTerm.split(splitterRegex)[1];
      }

    });
    if (cnt === 0) {
      splittedTerm[fields[0].name] = term;
      return splittedTerm;
    }
    remainingTerm = term;
    const localFields = [...fields].reverse();
    localFields.forEach((field) => {
      const splitterRegex = new RegExp(field.splitPrefix || '' + '(.+)', 'i');
      if (remainingTerm || remainingTerm !== '') {
        const values = remainingTerm.split(splitterRegex);
        remainingTerm = values[0];
        if (values[1]) {
          splittedTerm[field.name] = values[1].trim();
        }
      }
    });
    return splittedTerm;
  }

  private computeRequestParams(options: TextSearchOptions, queryParams): HttpParams {
    const wfsversion = this.storedQueriesOptions.storedquery_id.toLowerCase().includes('getfeaturebyid') ? '2.0.0' : '1.1.0';
    return new HttpParams({
      fromObject: Object.assign(
        {
          service: 'wfs',
          version: wfsversion,
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
          title: data.properties.title
        }
      },
      meta: {
        dataType: FEATURE,
        id,
        title: data.properties.title,
        titleHtml: data.properties.title,
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
