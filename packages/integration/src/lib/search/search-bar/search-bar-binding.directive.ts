import { Directive, Self, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

import { SearchBarComponent } from '@igo2/geo';
import { SearchState } from '../search.state';

@Directive({
  selector: '[igoSearchBarBinding]'
})
export class SearchBarBindingDirective implements OnInit, OnDestroy {

  get searchTerm(): string { return this.searchState.searchTerm$.value; }
  get searchType(): string { return this.searchState.searchType$.value; }

  private searchTerm$$: Subscription;
  private searchType$$: Subscription;
  private searchDisabled$$: Subscription;

  constructor(
    @Self() private component: SearchBarComponent,
    private searchState: SearchState
  ) {}

  ngOnInit() {
    this.searchTerm$$ = this.searchState.searchTerm$.subscribe((searchTerm: string) => {
      if (searchTerm !== undefined && searchTerm !== null) {
        this.component.setTerm(searchTerm);
      }
    });

    this.searchType$$ = this.searchState.searchType$.subscribe((searchType: string) => {
      if (searchType !== undefined && searchType !== null) {
        this.component.setSearchType(searchType);
      }
    });

    this.searchDisabled$$ = this.searchState.searchDisabled$.subscribe((searchDisabled: boolean) => {
      this.component.disabled = searchDisabled;
    });
  }

  ngOnDestroy() {
    this.searchTerm$$.unsubscribe();
    this.searchType$$.unsubscribe();
    this.searchDisabled$$.unsubscribe();
  }

  @HostListener('searchTermChange', ['$event'])
  onSearchTermChange(searchTerm?: string) {
    if (searchTerm !== this.searchTerm) {
      this.searchState.setSearchTerm(searchTerm);
    }
  }

  @HostListener('searchTypeChange', ['$event'])
  onSearchTypeChange(searchType?: string) {
    if (searchType !== this.searchType) {
      this.searchState.setSearchType(searchType);
    }
  }
}
