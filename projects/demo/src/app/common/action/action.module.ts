import { NgModule } from '@angular/core';

import { IgoActionModule, IgoContextMenuModule } from '@igo2/common';


import { AppActionRoutingModule } from './action-routing.module';
import { AppActionComponent } from './action.component';

@NgModule({
  imports: [
    AppActionRoutingModule,
    IgoActionModule,
    IgoContextMenuModule,
    AppActionComponent
],
  exports: [AppActionComponent]
})
export class AppActionModule {}
