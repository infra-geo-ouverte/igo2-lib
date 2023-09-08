import { NgModule } from '@angular/core';

import { IgoMapModule, IgoDrawModule } from '@igo2/geo';

import { AppDrawComponent } from './draw.component';
import { AppDrawRoutingModule } from './draw-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppDrawComponent],
  imports: [
    AppDrawRoutingModule,
    SharedModule,
    IgoMapModule,
    IgoDrawModule
  ],
  exports: [AppDrawComponent]
})
export class AppDrawModule {}
