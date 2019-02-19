import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule } from '@angular/material';

import { IgoActionModule } from '@igo2/common';

import { AppActionComponent } from './action.component';
import { AppActionRoutingModule } from './action-routing.module';

@NgModule({
  declarations: [
    AppActionComponent
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
