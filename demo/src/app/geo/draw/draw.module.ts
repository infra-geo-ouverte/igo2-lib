import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

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
