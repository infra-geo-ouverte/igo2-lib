import { Directive, OnDestroy, OnInit, inject } from '@angular/core';

import { SearchBarComponent } from '@igo2/geo';

import { Subscription } from 'rxjs';

import { SearchState } from '../search.state';

@Directive({
  selector: '[igoSearchBarBinding]',
  host: {
    '(searchTermChange)': 'onSearchTermChange($any($event))',
    '(searchTypeChange)': 'onSearchTypeChange($any($event))'
  }
})
export class SearchBarBindingDirective implements OnInit, OnDestroy {
  private component = inject(SearchBarComponent, { self: true });
  private searchState = inject(SearchState);

  get searchTerm(): string {
    return this.searchState.searchTerm$.value;
  }
  get searchType(): string {
    return this.searchState.searchType$.value;
  }

  private searchTerm$$: Subscription;
  private searchType$$: Subscription;
  private searchDisabled$$: Subscription;

  ngOnInit() {
    this.searchTerm$$ = this.searchState.searchTerm$.subscribe((searchTerm) => {
      if (searchTerm !== undefined && searchTerm !== null) {
        this.component.setTerm(searchTerm);
      }
    });

    this.searchType$$ = this.searchState.searchType$.subscribe((searchType) => {
      if (searchType !== undefined && searchType !== null) {
        this.component.setSearchType(searchType);
      }
    });

    this.searchDisabled$$ = this.searchState.searchDisabled$.subscribe(
      (searchDisabled) => {
        this.component.disabled = searchDisabled;
      }
    );
  }

  ngOnDestroy() {
    this.searchTerm$$.unsubscribe();
    this.searchType$$.unsubscribe();
    this.searchDisabled$$.unsubscribe();
  }

  onSearchTermChange(searchTerm?: string) {
    if (searchTerm !== this.searchTerm) {
      this.searchState.setSearchTerm(searchTerm);
    }
  }

  onSearchTypeChange(searchType?: string) {
    if (searchType !== this.searchType) {
      this.searchState.setSearchType(searchType);
    }
  }
}
