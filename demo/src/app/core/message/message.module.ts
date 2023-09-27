import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';

import { AppMessageComponent } from './message.component';
import { AppMessageRoutingModule } from './message-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppMessageComponent],
  imports: [AppMessageRoutingModule, SharedModule, IgoMessageModule.forRoot()],
  exports: [AppMessageComponent]
})
export class AppMessageModule {}
