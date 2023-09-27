import { NgModule } from '@angular/core';

import { IgoTableModule } from '@igo2/common';

import { AppTableComponent } from './table.component';
import { AppTableRoutingModule } from './table-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppTableComponent],
  imports: [SharedModule, AppTableRoutingModule, IgoTableModule],
  exports: [AppTableComponent]
})
export class AppTableModule {}
