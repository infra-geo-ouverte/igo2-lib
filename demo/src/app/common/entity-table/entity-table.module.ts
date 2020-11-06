import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { IgoEntityTableModule, IgoEntityTablePaginatorModule } from '@igo2/common';

import { AppEntityTableComponent } from './entity-table.component';
import { AppEntityTableRoutingModule } from './entity-table-routing.module';

@NgModule({
  declarations: [AppEntityTableComponent],
  imports: [
    AppEntityTableRoutingModule,
    MatCardModule,
    IgoEntityTableModule,
    IgoEntityTablePaginatorModule
  ],
  exports: [AppEntityTableComponent]
})
export class AppEntityTableModule {}
