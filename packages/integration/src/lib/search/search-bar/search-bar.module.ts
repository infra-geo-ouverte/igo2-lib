import { NgModule } from '@angular/core';

import { SearchBarBindingDirective } from './search-bar-binding.directive';

/**
 * @deprecated import the SearchBarBindingDirective directly
 */
@NgModule({
  imports: [SearchBarBindingDirective],
  exports: [SearchBarBindingDirective]
})
export class IgoAppSearchBarModule {}
