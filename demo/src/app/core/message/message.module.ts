import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

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
