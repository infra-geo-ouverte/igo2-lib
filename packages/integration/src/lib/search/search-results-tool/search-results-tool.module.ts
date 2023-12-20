import { NgModule } from '@angular/core';

import { SearchResultsToolComponent } from './search-results-tool.component';

/**
 * @deprecated import the SearchResultsToolComponent directly
 */
@NgModule({
  imports: [SearchResultsToolComponent],
  exports: [SearchResultsToolComponent]
})
export class IgoAppSearchResultsToolModule {}
