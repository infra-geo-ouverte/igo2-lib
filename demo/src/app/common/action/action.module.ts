import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule } from '@angular/material';

import { IgoActionModule } from '@igo2/common';

import { AppActionComponent } from './action.component';
import { AppActionRoutingModule } from './action-routing.module';
import {ContextMenuDirective} from '../../../../../packages/common/src/lib/context-menu';

@NgModule({
  declarations: [
    AppActionComponent,
    ContextMenuDirective
  ],
  imports: [
    AppActionRoutingModule,
    MatButtonModule,
    MatCardModule,
    IgoActionModule
  ],
  exports: [AppActionComponent]
})
export class AppActionModule {}
