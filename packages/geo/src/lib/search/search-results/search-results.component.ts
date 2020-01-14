import { LAYER } from './../../layer/shared/layer.enums';
import { FEATURE } from './../../feature/shared/feature.enums';
import { SEARCH_TYPES } from './../shared/search.enums';
import { TextSearchOptions } from './../shared/sources/source.interfaces';
import { SearchService } from './../shared/search.service';
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

import { Observable, EMPTY, timer } from 'rxjs';
import { debounce, map } from 'rxjs/operators';

import { EntityStore, EntityStoreWatcher } from '@igo2/common';

import { SearchResult, Research } from '../shared/search.interfaces';
import { SearchSource } from '../shared/sources/source';
import { IgoMap } from '../../map';
import { IChercheSearchSource } from './../shared/sources/icherche';
import { _MatTreeNodeMixinBase } from '@angular/material';

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

  /**
   * Page iterator for displaying more results function with icherche
   */
  public pageIteratorICherche: number = 2;

  /**
   * Page iterator for displaying more results function with ilayer
   */
  public pageIteratorILayer: number = 2;

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
    this.pageIteratorILayer = 2;
    this.pageIteratorICherche = 2;
  }
  public _term: string;

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
  }

  /**
   * Unbind the search results store from the watcher
   * @internal
   */
  ngOnDestroy() {
    this.watcher.destroy();
  }

  /**
   * When a result is focused, update it's state in the store and emit
   * an event.
   * @param result Search result
   * @internal
   */
  onResultFocus(result: SearchResult) {
    this.store.state.update(result, {focused: true}, true);
    this.resultFocus.emit(result);
  }

  onResultUnfocus(result: SearchResult) {
    this.resultUnfocus.emit(result);
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
      return {source, results: grouped.get(source)};
    });
  }

  isMoreResults(group: {source: SearchSource; results: SearchResult[]}) {
    if (group) {
      if (Number(group.source.params.limit) > group.results.length) {
        return false;
      }
      if (group.source.title === 'iCherche' && this.pageIteratorICherche > 10) {
        return false;
      }
      if (group.source.title === 'Couches' && this.pageIteratorILayer > 10) {
        return false;
      }
      return true;
    }
    return false;
  }

  displayMoreResults(group: {source: SearchSource; results: SearchResult[]}) {
    const searchTypeFeature: 'Feature' = FEATURE;
    const searchTypeLayer: 'Layer' = LAYER;
    const options: TextSearchOptions = {
      params: {
        page: group.source.title === 'Couches' ? this.pageIteratorILayer.toString() : this.pageIteratorICherche.toString()
      },
      searchType: group.source.title === 'Couches' ? searchTypeLayer : searchTypeFeature
    };

    const researches = this.searchService.search(this.term, options);
    group.source.title === 'Couches' ? this.pageIteratorILayer += 1 : this.pageIteratorICherche += 1;
    researches.map(research => {
      research.request.subscribe((results: SearchResult[]) => {
        const newResults = group.results.concat(results);
        this.moreResults.emit({research, results: newResults});
      });
    });
    return;
  }
}
