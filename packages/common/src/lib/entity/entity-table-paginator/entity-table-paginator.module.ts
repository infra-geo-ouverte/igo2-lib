import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';

import { EntityTablePaginatorComponent } from './entity-table-paginator.component';

/**
 * @ignore
 */
@NgModule({
  imports: [MatPaginatorModule],
  exports: [EntityTablePaginatorComponent],
  declarations: [EntityTablePaginatorComponent]
})
export class IgoEntityTablePaginatorModule {}
