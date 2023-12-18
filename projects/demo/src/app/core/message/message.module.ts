import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';

import { SharedModule } from '../../shared/shared.module';
import { AppMessageRoutingModule } from './message-routing.module';
import { AppMessageComponent } from './message.component';

@NgModule({
  imports: [
    AppMessageRoutingModule,
    SharedModule,
    IgoMessageModule.forRoot(),
    AppMessageComponent
  ],
  exports: [AppMessageComponent]
})
export class AppMessageModule {}
