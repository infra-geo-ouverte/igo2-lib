import { NgModule } from '@angular/core';

import { IgoActionModule, IgoContextMenuModule } from '@igo2/common';

import { AppActionComponent } from './action.component';
import { AppActionRoutingModule } from './action-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppActionComponent],
  imports: [
    SharedModule,
    AppActionRoutingModule,
    IgoActionModule,
    IgoContextMenuModule
  ],
  exports: [AppActionComponent]
})
export class AppActionModule {}
