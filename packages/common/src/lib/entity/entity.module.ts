import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoEntitySelectorModule } from './entity-selector/entity-selector.module';
import { IgoEntityTablePaginatorModule } from './entity-table-paginator/entity-table-paginator.module';
import { IgoEntityTableModule } from './entity-table/entity-table.module';

@NgModule({
  imports: [CommonModule],
  exports: [
    IgoEntitySelectorModule,
    IgoEntityTableModule,
    IgoEntityTablePaginatorModule
  ],
  declarations: []
})
export class IgoEntityModule {}
