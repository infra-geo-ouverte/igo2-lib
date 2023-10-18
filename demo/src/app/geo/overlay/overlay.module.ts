import { NgModule } from '@angular/core';

import { IgoMapModule, IgoOverlayModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppOverlayRoutingModule } from './overlay-routing.module';
import { AppOverlayComponent } from './overlay.component';

@NgModule({
  declarations: [AppOverlayComponent],
  imports: [
    SharedModule,
    AppOverlayRoutingModule,
    IgoMapModule,
    IgoOverlayModule
  ],
  exports: [AppOverlayComponent]
})
export class AppOverlayModule {}
