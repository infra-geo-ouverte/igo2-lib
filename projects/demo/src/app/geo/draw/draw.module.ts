import { NgModule } from '@angular/core';

import { IgoDrawModule, IgoMapModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppDrawRoutingModule } from './draw-routing.module';
import { AppDrawComponent } from './draw.component';

@NgModule({
  imports: [
    AppDrawRoutingModule,
    SharedModule,
    IgoMapModule,
    IgoDrawModule,
    AppDrawComponent
  ],
  exports: [AppDrawComponent]
})
export class AppDrawModule {}
