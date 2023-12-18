import { NgModule } from '@angular/core';

import {
  IgoEntityTableModule,
  IgoEntityTablePaginatorModule
} from '@igo2/common';


import { AppEntityTableRoutingModule } from './entity-table-routing.module';
import { AppEntityTableComponent } from './entity-table.component';

@NgModule({
  imports: [
    AppEntityTableRoutingModule,
    IgoEntityTableModule,
    IgoEntityTablePaginatorModule,
    AppEntityTableComponent
],
  exports: [AppEntityTableComponent]
})
export class AppEntityTableModule {}
