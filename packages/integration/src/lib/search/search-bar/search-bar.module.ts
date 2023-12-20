import { NgModule } from '@angular/core';

import { IgoSearchModule } from '@igo2/geo';

import { SearchBarBindingDirective } from './search-bar-binding.directive';

/**
 * @ignore
 */
@NgModule({
    imports: [IgoSearchModule, SearchBarBindingDirective],
    exports: [SearchBarBindingDirective]
})
export class IgoAppSearchBarModule {}
