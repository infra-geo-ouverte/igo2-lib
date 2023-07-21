import { NgModule } from '@angular/core';

import { IgoMapModule, IgoOverlayModule } from '@igo2/geo';

import { AppOverlayComponent } from './overlay.component';
import { AppOverlayRoutingModule } from './overlay-routing.module';
import { SharedModule } from '../../shared/shared.module';

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
