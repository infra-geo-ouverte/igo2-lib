import { NgModule } from '@angular/core';
import { EntityTablePaginatorComponent } from './entity-table-paginator.component';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';

/**
 * @ignore
 */
@NgModule({
  imports: [
    MatPaginatorModule,
  ],
  exports: [
    EntityTablePaginatorComponent
  ],
  declarations: [
    EntityTablePaginatorComponent,
  ]
})
export class IgoEntityTablePaginatorModule {}
