import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { IgoTableModule } from '@igo2/common';

import { AppTableComponent } from './table.component';
import { AppTableRoutingModule } from './table-routing.module';

@NgModule({
  declarations: [AppTableComponent],
  imports: [
    AppTableRoutingModule,
    MatCardModule,
    IgoTableModule
  ],
  exports: [AppTableComponent]
})
export class AppTableModule {}
