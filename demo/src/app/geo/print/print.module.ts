import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';
import { IgoMapModule, IgoPrintModule } from '@igo2/geo';

import { AppPrintComponent } from './print.component';
import { AppPrintRoutingModule } from './print-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { IgoContextModule } from '@igo2/context';

@NgModule({
  declarations: [AppPrintComponent],
  imports: [
    SharedModule,
    AppPrintRoutingModule,
    IgoMessageModule,
    IgoMapModule,
    IgoPrintModule,
    IgoContextModule
  ],
  exports: [AppPrintComponent]
})
export class AppPrintModule {}
