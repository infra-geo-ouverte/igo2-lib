import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoGeoModule } from '@igo2/geo';

import { AppGeoComponent } from './geo.component';
import { AppGeoRoutingModule } from './geo-routing.module';

@NgModule({
  declarations: [AppGeoComponent],
  imports: [
    AppGeoRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoGeoModule,
    IgoLanguageModule.forRoot()
  ],
  exports: [AppGeoComponent]
})
export class AppGeoModule {}
