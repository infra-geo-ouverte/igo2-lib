import { NgModule } from '@angular/core';

import { IgoEntityTableModule, IgoEntityTablePaginatorModule } from '@igo2/common';

import { AppEntityTableComponent } from './entity-table.component';
import { AppEntityTableRoutingModule } from './entity-table-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppEntityTableComponent],
  imports: [
    AppEntityTableRoutingModule,
    SharedModule,
    IgoEntityTableModule,
    IgoEntityTablePaginatorModule
  ],
  exports: [AppEntityTableComponent]
})
export class AppEntityTableModule {}
