import { NgModule } from '@angular/core';

import { IgoMapModule, IgoOverlayModule } from '@igo2/geo';


import { AppOverlayRoutingModule } from './overlay-routing.module';
import { AppOverlayComponent } from './overlay.component';

@NgModule({
  imports: [
    AppOverlayRoutingModule,
    IgoMapModule,
    IgoOverlayModule,
    AppOverlayComponent
],
  exports: [AppOverlayComponent]
})
export class AppOverlayModule {}
