import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material';

import { IgoLibEntityTableModule } from '@igo2/common';

import { AppEntityTableComponent } from './entity-table.component';
import { AppEntityTableRoutingModule } from './entity-table-routing.module';

@NgModule({
  declarations: [AppEntityTableComponent],
  imports: [
    AppEntityTableRoutingModule,
    MatCardModule,
    IgoLibEntityTableModule
  ],
  exports: [AppEntityTableComponent]
})
export class AppEntityTableModule {}
