import { NgModule } from '@angular/core';

import { EntityTableComponent } from './entity-table.component';

/**
 * @deprecated import the EntityTableComponent directly
 */
@NgModule({
  imports: [EntityTableComponent],
  exports: [EntityTableComponent]
})
export class IgoEntityTableModule {}
