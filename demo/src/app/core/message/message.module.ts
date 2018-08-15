import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoMessageModule } from '@igo2/core';

import { AppMessageComponent } from './message.component';
import { AppMessageRoutingModule } from './message-routing.module';

@NgModule({
  declarations: [AppMessageComponent],
  imports: [
    AppMessageRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMessageModule.forRoot()
  ],
  exports: [AppMessageComponent]
})
export class AppMessageModule {}
