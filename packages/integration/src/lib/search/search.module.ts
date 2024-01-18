import { NgModule } from '@angular/core';

import { SearchBarBindingDirective } from './search-bar/search-bar-binding.directive';
import { SearchResultsToolComponent } from './search-results-tool/search-results-tool.component';

/**
 * @deprecated import the components/directive directly or INTEGRATION_SEARCH_DIRECTIVES for the set
 */
@NgModule({
  imports: [SearchBarBindingDirective, SearchResultsToolComponent],
  exports: [SearchBarBindingDirective, SearchResultsToolComponent]
})
export class IgoAppSearchModule {}
