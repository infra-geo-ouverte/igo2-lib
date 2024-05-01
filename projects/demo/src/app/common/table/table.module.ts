import { NgModule } from '@angular/core';

import { IgoTableModule } from '@igo2/common';

import { AppTableRoutingModule } from './table-routing.module';
import { AppTableComponent } from './table.component';

@NgModule({
  imports: [AppTableRoutingModule, IgoTableModule, AppTableComponent],
  exports: [AppTableComponent]
})
export class AppTableModule {}
