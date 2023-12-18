import { NgModule } from '@angular/core';

import { IgoTableModule } from '@igo2/common';

import { SharedModule } from '../../shared/shared.module';
import { AppTableRoutingModule } from './table-routing.module';
import { AppTableComponent } from './table.component';

@NgModule({
  imports: [
    SharedModule,
    AppTableRoutingModule,
    IgoTableModule,
    AppTableComponent
  ],
  exports: [AppTableComponent]
})
export class AppTableModule {}
