import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { IgoActionModule, IgoContextMenuModule } from '@igo2/common';

import { AppActionComponent } from './action.component';
import { AppActionRoutingModule } from './action-routing.module';

@NgModule({
  declarations: [AppActionComponent],
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
