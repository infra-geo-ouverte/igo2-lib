import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';

import { SharedModule } from '../../shared/shared.module';
import { AppMessageRoutingModule } from './message-routing.module';
import { AppMessageComponent } from './message.component';

@NgModule({
  declarations: [AppMessageComponent],
  imports: [AppMessageRoutingModule, SharedModule, IgoMessageModule.forRoot()],
  exports: [AppMessageComponent]
})
export class AppMessageModule {}
