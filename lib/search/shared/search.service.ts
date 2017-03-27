import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { RequestService } from '../../core';

import { SearchSourceService } from './search-source.service';
import { SearchResult } from './search-result.interface';
import { SearchSource } from '../search-sources/search-source';


@Injectable()
export class SearchService {

  public results$ = new BehaviorSubject<SearchResult[]>([]);
  public subscriptions: Subscription[] = [];

  private results = [];

  constructor(private searchSourceService: SearchSourceService,
              private requestService: RequestService) {
  }

  search(term: string) {
    const sources = this.searchSourceService.sources;

    this.unsubscribe();
    this.subscriptions = sources.map((source: SearchSource) =>
      this.searchSource(source, term));
  }

  searchSource(source: SearchSource, term?: string) {
    const request = source.search(term);

    return this.requestService
      .register(request, source.getName())
      .subscribe((results: SearchResult[]) =>
        this.handleSearchResults(results, source));
  }

  clear() {
    this.unsubscribe();
     this.results$.next([]);
  }

  private unsubscribe() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  private handleSearchResults(results: SearchResult[], source: SearchSource) {
    const results_ = this.results$.value
      .filter(result => result.source !== source.getName())
      .concat(results);

    this.results$.next(results_);
  }
}
