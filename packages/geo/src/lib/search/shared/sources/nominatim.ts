import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FEATURE, Feature, FeatureGeometry } from '../../../feature';

import { SearchResult } from '../search.interfaces';
import { SearchSource, TextSearch } from './source';
import { SearchSourceOptions, TextSearchOptions, SearchSourceSettings } from './source.interfaces';
import { NominatimData } from './nominatim.interfaces';

/**
 * Nominatim search source
 */
@Injectable()
export class NominatimSearchSource extends SearchSource implements TextSearch {
  static id = 'nominatim';
  static type = FEATURE;

  constructor(
    private http: HttpClient,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options);
  }

  getId(): string {
    return NominatimSearchSource.id;
  }

  /*
   * Source : https://wiki.openstreetmap.org/wiki/Key:amenity
  */
  protected getDefaultOptions(): SearchSourceOptions {
    return {
      title: 'Nominatim (OSM)',
      searchUrl: 'https://nominatim.openstreetmap.org/search',
      settings: [
        {
            type: 'checkbox',
            title: 'results type',
            name: 'amenity',
            values: [
              {
                title: 'Restauration',
                value: 'bar,bbq,biergaten,cafe,drinking_water,fast_food,food_court,ice_cream,pub,restaurant',
                enabled: false
              },
              {
                title: 'Santé',
                value: 'baby_hatch,clinic,dentist,doctors,hospital,nursing_home,pharmacy,social_facility,veterinary',
                enabled: false
              },
              {
                title: 'Divertissement',
                value: 'arts_centre,brothel,casino,cinema,community_center_fountain,gambling,nightclub,planetarium \
                          ,public_bookcase,social_centre,stripclub,studio,swingerclub,theatre,internet_cafe',
                enabled: false
              },
              {
                title: 'Finance',
                value: 'atm,bank,bureau_de_change',
                enabled: false
              }
            ]
        },
        {
          type: 'radiobutton',
          title: 'results limit',
          name: 'limit',
          values: [
            {
              title: '10',
              value: 10,
              enabled: true
            },
            {
              title: '20',
              value: 20,
              enabled: false
            },
            {
              title: '50',
              value: 50,
              enabled: false
            }
          ]
        },
        {
          type: 'radiobutton',
          title: 'country limitation',
          name: 'countrycodes',
          values: [
            {
              title: 'Canada',
              value: 'CA',
              enabled: true
            },
            {
              title: 'Le monde',
              value: null,
              enabled: false
            }
          ]
        },
        {
          type: 'radiobutton',
          title: 'multiple object',
          name: 'dedupe',
          values: [
            {
              title: 'Oui',
              value: 0,
              enabled: false
            },
            {
              title: 'Non',
              value: 1,
              enabled: true
            }
          ]
        }
      ]
    };
  }

  /**
   * Search a place by name
   * @param term Place name
   * @returns Observable of <SearchResult<Feature>[]
   */
  search(
    term: string | undefined,
    options?: TextSearchOptions
  ): Observable<SearchResult<Feature>[]> {
    const params = this.computeSearchRequestParams(term, options || {});
    return this.http
      .get(this.searchUrl, { params })
      .pipe(map((response: NominatimData[]) => this.extractResults(response)));
  }

  private computeSearchRequestParams(
    term: string,
    options: TextSearchOptions
  ): HttpParams {
    return new HttpParams({
      fromObject: Object.assign(
        {
          q: this.computeTerm(term),
          format: 'json'
        },
        this.params,
        options.params || {}
      )
    });
  }

  private extractResults(response: NominatimData[]): SearchResult<Feature>[] {
    return response.map((data: NominatimData) => this.dataToResult(data));
  }

  private dataToResult(data: NominatimData): SearchResult<Feature> {
    const properties = this.computeProperties(data);
    const geometry = this.computeGeometry(data);
    const extent = this.computeExtent(data);
    const id = [this.getId(), 'place', data.place_id].join('.');

    return {
      source: this,
      meta: {
        dataType: FEATURE,
        id,
        title: data.display_name,
        icon: 'map-marker'
      },
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry,
        extent,
        properties,
        meta: {
          id,
          title: data.display_name
        }
      }
    };
  }

  private computeProperties(data: NominatimData): { [key: string]: any } {
    return {
      display_name: data.display_name,
      place_id: data.place_id,
      osm_type: data.osm_type,
      class: data.class,
      type: data.type
    };
  }

  private computeGeometry(data: NominatimData): FeatureGeometry {
    return {
      type: 'Point',
      coordinates: [parseFloat(data.lon), parseFloat(data.lat)]
    };
  }

  private computeExtent(data: NominatimData): [number, number, number, number] {
    return [
      parseFloat(data.boundingbox[2]),
      parseFloat(data.boundingbox[0]),
      parseFloat(data.boundingbox[3]),
      parseFloat(data.boundingbox[1])
    ];
  }

  private computeTerm(term: string): string {
    term = this.computeTermTags(term);
    return term;
  };

  /**
   * Add hashtag from query in Nominatim's format (+[])
   * @param term Query with hashtag
  */
  private computeTermTags(term: string): string {
    const tags = term.match(/(#[^\s]+)/g);

    let addTagsFromSettings = true;
    if ( tags ) {
      tags.forEach( value => {
        term = term.replace(value,'');
        term += '+[' + value.substring(1) + ']';
        addTagsFromSettings = false;
      });
      addTagsFromSettings = false;
    }

    if (addTagsFromSettings) {
      term = this.computeTermSettings(term);
    }
    return term;
  };

  /**
   * Add hashtag from settings in Nominatim's format (+[])
   * @param term Query
  */
  private computeTermSettings(term: string): string {
    this.options.settings.forEach( settings => {
      if (settings.name === 'amenity') {
        settings.values.forEach( conf => {
          if (conf.enabled && typeof conf.value === 'string') {
            const splitted = conf.value.split(',');
            splitted.forEach( value => {
              term += '+['+value+']';
            })
          }
        });
      }
    });
    return term;
  }

  private

}
