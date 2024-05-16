import { SearchBarBindingDirective } from './search-bar/search-bar-binding.directive';
import { SearchResultsToolComponent } from './search-results-tool/search-results-tool.component';

export const INTEGRATION_SEARCH_DIRECTIVES = [
  SearchBarBindingDirective,
  SearchResultsToolComponent
] as const;
