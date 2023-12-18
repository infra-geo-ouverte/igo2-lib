import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';
import { IgoMapModule, IgoPrintModule } from '@igo2/geo';


import { AppPrintRoutingModule } from './print-routing.module';
import { AppPrintComponent } from './print.component';

@NgModule({
  imports: [
    AppPrintRoutingModule,
    IgoMessageModule,
    IgoMapModule,
    IgoPrintModule,
    AppPrintComponent
],
  exports: [AppPrintComponent]
})
export class AppPrintModule {}
