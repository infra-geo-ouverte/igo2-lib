import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Message } from '../../core';
import { Feature, FeatureService } from '../../feature';

import { SearchSourceService } from './search-source.service';
import { SearchSource } from '../search-sources/search-source';


@Injectable()
export class SearchService {


  constructor(private searchSourceService: SearchSourceService,
              private featureService: FeatureService) {
  }
  locate(coordinates: [number, number], zoom: number = 18) {
    return this.searchSourceService.sources
    .filter((source: SearchSource) => source.enabled)
    .map((source: SearchSource) => this.locateSource(source, coordinates, zoom));

  }

  locateSource(
    source: SearchSource,
    coordinates: [number, number],
    zoom): Observable<Feature[] | Message[]> {
    const request = source.locate(coordinates, zoom);
    return request
    }

  search(term: string): Observable<Feature[] | Message[]>[] {
    if (!term || term === '') {
      this.featureService.clear();
      return;
    }

    return this.searchSourceService.sources
      .filter((source: SearchSource) => source.enabled)
      .map((source: SearchSource) => this.searchSource(source, term));
  }

  searchSource(source: SearchSource, term?: string): Observable<Feature[] | Message[]> {
    const request = source.search(term);

    return request
    }
}
