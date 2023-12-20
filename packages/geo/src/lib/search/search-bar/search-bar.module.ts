import { NgModule } from '@angular/core';

import { SearchBarComponent } from './search-bar.component';

/**
 * @deprecated import the SearchBarComponent directly
 */
@NgModule({
  imports: [SearchBarComponent],
  exports: [SearchBarComponent]
})
export class IgoSearchBarModule {}
