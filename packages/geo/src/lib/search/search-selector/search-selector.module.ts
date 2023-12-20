import { NgModule } from '@angular/core';

import { SearchSelectorComponent } from './search-selector.component';

/**
 * @deprecated import the SearchSelectorComponent directly
 */
@NgModule({
  imports: [SearchSelectorComponent],
  exports: [SearchSelectorComponent]
})
export class IgoSearchSelectorModule {}
