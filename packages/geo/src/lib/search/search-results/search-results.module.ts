import { NgModule } from '@angular/core';

import { SearchResultAddButtonComponent } from './search-results-add-button.component';
import { SearchResultsComponent } from './search-results.component';

/**
 * @deprecated import the components directly or the SEARCH_RESULTS_DIRECTIVES
 */
@NgModule({
  imports: [SearchResultsComponent, SearchResultAddButtonComponent],
  exports: [SearchResultsComponent, SearchResultAddButtonComponent]
})
export class IgoSearchResultsModule {}
