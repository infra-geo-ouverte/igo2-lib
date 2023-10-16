import { NgModule } from '@angular/core';

import {
  IgoEntityTableModule,
  IgoEntityTablePaginatorModule
} from '@igo2/common';

import { SharedModule } from '../../shared/shared.module';
import { AppEntityTableRoutingModule } from './entity-table-routing.module';
import { AppEntityTableComponent } from './entity-table.component';

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
