import { NgModule } from '@angular/core';

import { IgoMapModule } from '@igo2/geo';

import { AppHoverComponent } from './hover.component';
import { AppHoverRoutingModule } from './hover-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppHoverComponent],
  imports: [
    SharedModule,
    AppHoverRoutingModule,
    IgoMapModule
  ],
  exports: [AppHoverComponent]
})
export class AppHoverModule {}
