import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { IgoMessageModule } from '@igo2/core';
import { IgoMapModule, IgoPrintModule } from '@igo2/geo';

import { AppPrintComponent } from './print.component';
import { AppPrintRoutingModule } from './print-routing.module';

@NgModule({
  declarations: [AppPrintComponent],
  imports: [
    AppPrintRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMessageModule,
    IgoMapModule,
    IgoPrintModule
  ],
  exports: [AppPrintComponent]
})
export class AppPrintModule {}
