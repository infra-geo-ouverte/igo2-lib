import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoEntitySelectorModule } from './entity-selector/entity-selector.module';
import { IgoEntityTableModule } from './entity-table/entity-table.module';
import { IgoEntityTablePaginatorModule } from './entity-table-paginator/entity-table-paginator.module';

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
