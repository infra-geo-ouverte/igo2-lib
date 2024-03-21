import { SearchResultAddButtonComponent } from './search-results-add-button.component';
import { SearchResultsComponent } from './search-results.component';

export * from './search-results-add-button.component';
export * from './search-results.component';
export * from './search-results.module';

export const SEARCH_RESULTS_DIRECTIVES = [
  SearchResultsComponent,
  SearchResultAddButtonComponent
] as const;
