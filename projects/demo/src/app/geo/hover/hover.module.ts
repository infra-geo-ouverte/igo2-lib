import { NgModule } from '@angular/core';

import { IgoMapModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppHoverRoutingModule } from './hover-routing.module';
import { AppHoverComponent } from './hover.component';

@NgModule({
  imports: [
    SharedModule,
    AppHoverRoutingModule,
    IgoMapModule,
    AppHoverComponent
  ],
  exports: [AppHoverComponent]
})
export class AppHoverModule {}
