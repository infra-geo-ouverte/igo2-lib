import { NgModule } from '@angular/core';

import { EntitySelectorComponent } from './entity-selector.component';

/**
 * @deprecated import the EntitySelectorComponent directly
 */
@NgModule({
  imports: [EntitySelectorComponent],
  exports: [EntitySelectorComponent]
})
export class IgoEntitySelectorModule {}
