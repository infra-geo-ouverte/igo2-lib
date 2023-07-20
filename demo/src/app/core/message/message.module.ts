import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

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
