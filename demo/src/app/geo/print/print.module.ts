import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';
import { IgoMapModule, IgoPrintModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppPrintRoutingModule } from './print-routing.module';
import { AppPrintComponent } from './print.component';

@NgModule({
  declarations: [AppPrintComponent],
  imports: [
    SharedModule,
    AppPrintRoutingModule,
    IgoMessageModule,
    IgoMapModule,
    IgoPrintModule
  ],
  exports: [AppPrintComponent]
})
export class AppPrintModule {}
