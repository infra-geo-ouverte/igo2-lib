import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';

import { EntityTablePaginatorComponent } from './entity-table-paginator.component';

/**
 * @ignore
 */
@NgModule({
    imports: [MatPaginatorModule, EntityTablePaginatorComponent],
    exports: [EntityTablePaginatorComponent]
})
export class IgoEntityTablePaginatorModule {}
