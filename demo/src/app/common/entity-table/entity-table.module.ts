import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

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
