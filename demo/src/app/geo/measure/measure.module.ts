import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { IgoMapModule, IgoMeasureModule } from '@igo2/geo';

import { AppMeasureComponent } from './measure.component';
import { AppMeasureRoutingModule } from './measure-routing.module';

@NgModule({
  declarations: [AppMeasureComponent],
  imports: [
    AppMeasureRoutingModule,
    MatCardModule,
    IgoMapModule,
    IgoMeasureModule
  ],
  exports: [AppMeasureComponent]
})
export class AppMeasureModule {}
