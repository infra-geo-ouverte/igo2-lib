import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoMapModule, IgoOverlayModule } from '@igo2/geo';

import { AppOverlayComponent } from './overlay.component';
import { AppOverlayRoutingModule } from './overlay-routing.module';

@NgModule({
  declarations: [AppOverlayComponent],
  imports: [
    AppOverlayRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMapModule,
    IgoOverlayModule
  ],
  exports: [AppOverlayComponent]
})
export class AppOverlayModule {}
