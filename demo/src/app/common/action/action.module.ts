import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule } from '@angular/material';

import { IgoActionModule } from '@igo2/common';

import { AppActionComponent } from './action.component';
import { AppActionRoutingModule } from './action-routing.module';
import {IgoContextMenuModule} from '../../../../../packages/common/src/lib/context-menu/context-menu.module';

@NgModule({
  declarations: [
    AppActionComponent],
  imports: [
    AppActionRoutingModule,
    MatButtonModule,
    MatCardModule,
    IgoActionModule,
    IgoContextMenuModule
  ],
  exports: [AppActionComponent]
})
export class AppActionModule {}
