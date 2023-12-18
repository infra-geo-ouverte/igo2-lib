import { NgModule } from '@angular/core';

import { IgoMapModule } from '@igo2/geo';


import { AppHoverRoutingModule } from './hover-routing.module';
import { AppHoverComponent } from './hover.component';

@NgModule({
  imports: [
    AppHoverRoutingModule,
    IgoMapModule,
    AppHoverComponent
],
  exports: [AppHoverComponent]
})
export class AppHoverModule {}
