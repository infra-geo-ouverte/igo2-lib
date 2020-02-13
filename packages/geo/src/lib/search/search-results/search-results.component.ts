import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  TemplateRef,
  OnDestroy
} from '@angular/core';

import { Observable, EMPTY, timer, BehaviorSubject } from 'rxjs';
import { debounce, map } from 'rxjs/operators';

import { EntityStore, EntityStoreWatcher } from '@igo2/common';

import { IgoMap } from '../../map';

import { TextSearchOptions } from '../shared/sources/source.interfaces';
import { SearchService } from '../shared/search.service';
import { SearchResult, Research } from '../shared/search.interfaces';
import { SearchSource } from '../shared/sources/source';

export enum SearchResultMode {
  Grouped = 'grouped',
  Flat = 'flat'
}

/**
 * List of search results with focus and selection capabilities.
 * This component is dumb and only emits events.
 */
@Component({
  selector: 'igo-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  /**
   * Reference to the SearchResultMode enum
   * @internal
   */
  public searchResultMode = SearchResultMode;

  /**
   * Search results store watcher
   */
  private watcher: EntityStoreWatcher<SearchResult>;

  public pageIterator: {sourceId: string}[] = [];

  public collapsed: {sourceId: string}[] = [];

  @Input() map: IgoMap;

  /**
   * Search results store
   */
  @Input() store: EntityStore<SearchResult>;

  /**
   * to show hide results icons
   */
  @Input() showIcons: boolean;

  /**
   * Search results display mode
   */
  @Input() mode: SearchResultMode = SearchResultMode.Grouped;

  /**
   * Whether there should be a zoom button
   */
  @Input() withZoomButton = false;

  /**
   * Search term
   */
  @Input()
  get term(): string {
    return this._term;
  }
  set term(value: string) {
    this._term = value;
    this.pageIterator = [];
  }
  public _term: string;

  @Input() settingsChange$ = new BehaviorSubject<boolean>(undefined);

  /**
   * Event emitted when a result is focused
   */
  @Output() resultFocus = new EventEmitter<SearchResult>();

  /**
   * Event emitted when a result is unfocused
   */
  @Output() resultUnfocus = new EventEmitter<SearchResult>();

  /**
   * Event emitted when a result is selected
   */
  @Output() resultSelect = new EventEmitter<SearchResult>();

  /**
   * Event emitted when a research is completed after displaying more results is clicked
   */
  @Output() moreResults = new EventEmitter<{
    research: Research;
    results: SearchResult[];
  }>();

  /**
   * Events emitted when a result is focus or unfocus by mouse event
   */
  @Output() resultMouseenter = new EventEmitter<SearchResult>();
  @Output() resultMouseleave = new EventEmitter<SearchResult>();

  @ContentChild('igoSearchItemToolbar') templateSearchToolbar: TemplateRef<any>;

  get results$(): Observable<{source: SearchSource; results: SearchResult[]}[]> {
    if (this._results$ === undefined) {
      this._results$ = this.liftResults();
    }
    return this._results$;
  }
  private _results$: Observable<
    {source: SearchSource; results: SearchResult[]}[]
  >;

  constructor(private cdRef: ChangeDetectorRef,
              private searchService: SearchService) {}

  /**
   * Bind the search results store to the watcher
   * @internal
   */
  ngOnInit() {
    this.watcher = new EntityStoreWatcher(this.store, this.cdRef);

    this.settingsChange$.subscribe(() => {
      this.pageIterator = [];
    });
  }

  /**
   * Unbind the search results store from the watcher
   * @internal
   */
  ngOnDestroy() {
    this.watcher.destroy();
  }

  /**
   * Compute a group title
   * @param group Search results group
   * @returns Group title
   * @internal
   */
  computeGroupTitle(group: {source: SearchSource; results: SearchResult[]}): string {
    const parts = [group.source.title];
    const count = group.results.length;
    if (count > 1) {
      parts.push(`(${count})`);
    }
    return parts.join(' ');
  }

  /**
   * When a result is selected, update it's state in the store and emit
   * an event. A selected result is also considered focused
   * @param result Search result
   * @internal
   */
  onResultSelect(result: SearchResult) {
    if (this.store.state.get(result)) {
      if (this.store.state.get(result).selected === true) {
        return;
      }
    }
    this.store.state.update(result, {focused: true, selected: true}, true);
    this.resultSelect.emit(result);
  }

  /**
   * Return an observable of the search results, grouped by search source
   * @returns Observable of grouped search results
   * @internal
   */
  private liftResults(): Observable<{source: SearchSource; results: SearchResult[]}[]> {
    return this.store.view.all$().pipe(
      debounce((results: SearchResult[]) => {
        return results.length === 0 ? EMPTY : timer(200);
      }),
      map((results: SearchResult[]) => {
        return this.groupResults(results.sort(this.sortByOrder));
      })
    );
  }

  /**
   * Sort the results by display order.
   * @param r1 First result
   * @param r2 Second result
   */
  private sortByOrder(r1: SearchResult, r2: SearchResult) {
    return r1.source.displayOrder - r2.source.displayOrder;
  }

  /**
   * Group results by search source
   * @param results Search results from all sources
   * @returns Search results grouped by source
   */
  private groupResults(results: SearchResult[]): {source: SearchSource; results: SearchResult[]}[] {
    const grouped = new Map<SearchSource, SearchResult[]>();
    results.forEach((result: SearchResult) => {
      const source = result.source;
      let sourceResults = grouped.get(source);
      if (sourceResults === undefined) {
        sourceResults = [];
        grouped.set(source, sourceResults);
      }
      sourceResults.push(result);
    });

    return Array.from(grouped.keys()).map((source: SearchSource) => {
      if (this.pageIterator[source.getId()] === undefined) {
        this.pageIterator[source.getId()] = 1;
      }
      return {source, results: grouped.get(source)};
    });
  }

  isMoreResults(group: {source: SearchSource; results: SearchResult[]}) {
    return group.results && group.results[group.results.length - 1].meta.nextPage === true;
  }

  displayMoreResults(group: {source: SearchSource; results: SearchResult[]}) {
    const options: TextSearchOptions = {
      sourceId: group.source.getId(),
      page: ++this.pageIterator[group.source.getId()]
    };

    const researches = this.searchService.search(this.term, options);
    researches.map(research => {
      research.request.subscribe((results: SearchResult[]) => {
        const newResults = group.results.concat(results);
        if (!results.length) {
          newResults[newResults.length - 1].meta.nextPage = false;
        }
        this.moreResults.emit({research, results: newResults});
      });
    });
    return;
  }
}
