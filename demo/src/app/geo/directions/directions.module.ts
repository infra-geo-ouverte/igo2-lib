import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { IgoMessageModule } from '@igo2/core';
import {
  IgoMapModule,
  IgoDirectionsModule,
  provideOsrmDirectionsSource
} from '@igo2/geo';

import { AppDirectionsComponent } from './directions.component';
import { AppDirectionsRoutingModule } from './directions-routing.module';

@NgModule({
  declarations: [AppDirectionsComponent],
  imports: [
    AppDirectionsRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMessageModule,
    IgoMapModule,
    IgoDirectionsModule
  ],
  exports: [AppDirectionsComponent],
  providers: [provideOsrmDirectionsSource()]
})
export class AppDirectionsModule {}
