import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostBinding,
  ChangeDetectionStrategy
} from '@angular/core';
import { FloatLabelType } from '@angular/material';

import { Subject, Subscription, EMPTY, timer } from 'rxjs';
import { debounce, distinctUntilChanged } from 'rxjs/operators';

import { EntityStore } from '@igo2/common';

import { SEARCH_TYPES } from '../shared/search.enums';
import { SearchResult, Research } from '../shared/search.interfaces';
import { SearchService } from '../shared/search.service';

/**
 * Searchbar that triggers a research in all search sources enabled.
 * If the store input is defined, the search results will be loaded
 * into that store. An event is always emitted when a research is completed.
 */
@Component({
  selector: 'igo-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent implements OnInit, OnDestroy {
  /**
   * Invalid keys
   */
  private readonly invalidKeys = ['Control', 'Shift', 'Alt'];

  /**
   * Search term stream
   */
  private stream$ = new Subject<string>();

  /**
   * Subscription to the search term stream
   */
  private stream$$: Subscription;

  /**
   * Search term
   */
  @Input() term = '';

  /**
   * Whether a float label should be displayed
   */
  @Input() floatLabel: FloatLabelType = 'never';

  /**
   * Whether this component is disabled
   */
  @Input() disabled = false;

  /**
   * Icons color (search and clear)
   */
  @Input() color = 'primary';

  /**
   * Debounce time between each keystroke
   */
  @Input() debounce = 300;

  /**
   * Minimum term length required to trigger a research
   */
  @Input() minLength = 2;

  /**
   * Search icon
   */
  @Input() searchIcon: string;

  /**
   * Search results store
   */
  @Input() store: EntityStore<SearchResult>;

  /**
   * List of available search types
   */
  @Input() searchTypes: string[] = SEARCH_TYPES;

  /**
   * Event emitted when the search term changes
   */
  @Output() change = new EventEmitter<string>();

  /**
   * Event emitted when a research is completed
   */
  @Output() search = new EventEmitter<{
    research: Research;
    results: SearchResult[];
  }>();

  /**
   * Event emitted when the search type changes
   */
  @Output() searchTypeChange = new EventEmitter<string>();

  /**
   * Input element
   * @internal
   */
  @ViewChild('input') input: ElementRef;

  /**
   * Host's empty class
   * @internal
   */
  @HostBinding('class.empty')
  get emptyClass() {
    return this.empty;
  }

  /**
   * Whether the search bar is empty
   * @internal
   */
  get empty(): boolean {
    return this.term.length === 0;
  }

  /**
   * Search bar palceholder
   * @internal
   */
  set placeholder(value: string) {
    this._placeholder = value;
  }
  get placeholder(): string {
    return this.empty ? this._placeholder : '';
  }
  private _placeholder = '';

  constructor(private searchService: SearchService) {}

  /**
   * Subscribe to the search term stream and trigger researches
   * @internal
   */
  ngOnInit(): void {
    this.stream$$ = this.stream$
      .pipe(
        debounce((term: string) => {
          return term === '' ? EMPTY : timer(300);
        }),
        distinctUntilChanged()
      )
      .subscribe((term: string) => this.onTermChange(term));
  }

  /**
   * Unsubscribe to the search term stream
   * @internal
   */
  ngOnDestroy() {
    this.stream$$.unsubscribe();
  }

  /**
   * When a user types, validates the key and send it into the
   * stream if it's valid
   * @param event Keyboard event
   * @internal
   */
  onKeyup(event: KeyboardEvent) {
    const key = (event.target as HTMLInputElement).value;
    if (!this.keyIsValid(key)) {
      return;
    }
    this.setTerm(key);
  }

  /**
   * Clear the stream and the input
   * @internal
   */
  onClearButtonClick() {
    this.clear();
  }

  /**
   * Update the placeholder with the enabled search type. The placeholder
   * for all availables search typers needs to be defined in the locale
   * files or an error will be thrown.
   * @param searchType Enabled search type
   * @internal
   */
  onSearchTypeChange(searchType: string) {
    this.searchTypeChange.emit(searchType);
    this.placeholder = `search.${searchType.toLowerCase()}.placeholder`;
    this.doSearch(this.term);
  }

  /**
   * Send the term into the stream only if this component is not disabled
   * @param term Search term
   */
  setTerm(term: string) {
    if (this.disabled) {
      return;
    }

    this.term = term;
    if (term.length >= this.minLength || term.length === 0) {
      this.stream$.next(term);
    }
  }

  /**
   * Clear the stream and the input
   */
  private clear() {
    this.term = '';
    this.stream$.next(this.term);
    this.input.nativeElement.focus();
  }

  /**
   * Validate if a given key stroke is a valid input
   */
  private keyIsValid(key: string) {
    return this.invalidKeys.indexOf(key) === -1;
  }

  /**
   * When the search term changes, emit an event and trigger a
   * research in every enabled search sources.
   * @param term Search term
   */
  private onTermChange(term: string | undefined) {
    this.change.emit(term);
    this.doSearch(term);
  }

  /**
   * Execute the search
   * @param term Search term
   */
  private doSearch(term: string | undefined) {
    if (term === undefined || term === '') {
      if (this.store !== undefined) {
        this.store.clear();
      }
      return;
    }

    if (this.store !== undefined) {
      this.store.softClear();
    }

    const researches = this.searchService.search(term);
    researches.map(research => {
      research.request.subscribe((results: SearchResult[]) => {
        this.onResearchCompleted(research, results);
      });
    });
  }

  /**
   * When a research  is completed, emit an event and update
   * the store's items.
   * @param research Research
   * @param results Research results
   */
  private onResearchCompleted(research: Research, results: SearchResult[]) {
    this.search.emit({ research, results });

    if (this.store !== undefined) {
      const newResults = this.store.entities$.value
        .filter(result => result.source !== research.source)
        .concat(results);
      this.store.load(newResults);
    }
  }
}
