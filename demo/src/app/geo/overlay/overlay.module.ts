import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

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
