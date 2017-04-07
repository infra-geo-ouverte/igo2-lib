import { Component, OnInit, OnDestroy, Input, Output,
         EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { SearchResult } from '../shared';


@Component({
  selector: 'igo-search-result-list',
  templateUrl: './search-result-list.component.html',
  styleUrls: ['./search-result-list.component.styl']
})
export class SearchResultListComponent implements OnInit, OnDestroy {

  @Input()
  get results$(): Observable<SearchResult[]> { return this._results$; }
  set results$(value: Observable<SearchResult[]>) {
    this._results$ = value;
  }
  private _results$: Observable<SearchResult[]>;

  @Input()
  get focusedResult(): SearchResult { return this._focusedResult; }
  set focusedResult(value: SearchResult) {
    this._focusedResult = value;
  }
  private _focusedResult: SearchResult;

  private results$$: Subscription;
  private sourceResults: [string, SearchResult[]];

  @Output() focus = new EventEmitter<SearchResult>();
  @Output() select = new EventEmitter<SearchResult>();

  constructor() {}

  ngOnInit() {
    if (!this.results$) { return false; }

    this.results$$ = this.results$
      .subscribe((results: SearchResult[]) => this.handleResultsChanged(results));
  }

  ngOnDestroy() {
    this.results$$.unsubscribe();
  }

  private handleResultsChanged(results: SearchResult[]) {
    const groupedResults = {};

    results.forEach((result: SearchResult) => {
      const source = result.source;
      if (groupedResults[source] === undefined) {
        groupedResults[source] = [];
      }

      groupedResults[source].push(result);
    });

    const sourceResults = Object.keys(groupedResults).sort().map(
      (source: string) => [source, groupedResults[source]]);
    this.sourceResults = sourceResults as [string, SearchResult[]];
  }
}
