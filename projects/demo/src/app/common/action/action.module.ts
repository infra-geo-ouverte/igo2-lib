import { NgModule } from '@angular/core';

import { IgoActionModule, IgoContextMenuModule } from '@igo2/common';

import { SharedModule } from '../../shared/shared.module';
import { AppActionRoutingModule } from './action-routing.module';
import { AppActionComponent } from './action.component';

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
