import { NgModule } from '@angular/core';
import { EntityTablePaginatorComponent } from './entity-table-paginator.component';
import { MatPaginatorModule } from '@angular/material/paginator';

/**
 * @ignore
 */
@NgModule({
  imports: [MatPaginatorModule],
  exports: [EntityTablePaginatorComponent],
  declarations: [EntityTablePaginatorComponent]
})
export class IgoEntityTablePaginatorModule {}
