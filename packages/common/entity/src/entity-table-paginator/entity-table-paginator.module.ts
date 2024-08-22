import { NgModule } from '@angular/core';

import { EntityTablePaginatorComponent } from './entity-table-paginator.component';

/**
 * @deprecated import the EntityTablePaginatorComponent directly
 */
@NgModule({
  imports: [EntityTablePaginatorComponent],
  exports: [EntityTablePaginatorComponent]
})
export class IgoEntityTablePaginatorModule {}
