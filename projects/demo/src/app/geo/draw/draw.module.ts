import { NgModule } from '@angular/core';

import { IgoDrawModule, IgoMapModule } from '@igo2/geo';


import { AppDrawRoutingModule } from './draw-routing.module';
import { AppDrawComponent } from './draw.component';

@NgModule({
  imports: [
    AppDrawRoutingModule,
    IgoMapModule,
    IgoDrawModule,
    AppDrawComponent
],
  exports: [AppDrawComponent]
})
export class AppDrawModule {}
