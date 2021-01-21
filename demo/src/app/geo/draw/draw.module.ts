import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { IgoMapModule, IgoDrawModule } from '@igo2/geo';

import { AppDrawComponent } from './draw.component';
import { AppDrawRoutingModule } from './draw-routing.module';

@NgModule({
  declarations: [AppDrawComponent],
  imports: [
    AppDrawRoutingModule,
    MatCardModule,
    IgoMapModule,
    IgoDrawModule
  ],
  exports: [AppDrawComponent]
})
export class AppDrawModule {}
