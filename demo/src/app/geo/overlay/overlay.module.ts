import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

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
