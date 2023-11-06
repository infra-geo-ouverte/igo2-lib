import { NgModule } from '@angular/core';

import { IgoTableModule } from '@igo2/common';

import { SharedModule } from '../../shared/shared.module';
import { AppTableRoutingModule } from './table-routing.module';
import { AppTableComponent } from './table.component';

@NgModule({
  declarations: [AppTableComponent],
  imports: [SharedModule, AppTableRoutingModule, IgoTableModule],
  exports: [AppTableComponent]
})
export class AppTableModule {}
