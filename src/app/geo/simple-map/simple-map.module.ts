import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoMapModule } from '@igo2/geo';

import { AppSimpleMapComponent } from './simple-map.component';
import { AppSimpleMapRoutingModule } from './simple-map-routing.module';

@NgModule({
  declarations: [AppSimpleMapComponent],
  imports: [
    AppSimpleMapRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMapModule,
    IgoLanguageModule.forRoot()
  ],
  exports: [AppSimpleMapComponent]
})
export class AppSimpleMapModule {}
