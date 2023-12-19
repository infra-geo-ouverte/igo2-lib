import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { IgoErrorModule, IgoLanguageModule } from '@igo2/core';

import { AppRequestRoutingModule } from './request-routing.module';
import { AppRequestComponent } from './request.component';

@NgModule({
  imports: [
    AppRequestRoutingModule,
    HttpClientModule,
    IgoLanguageModule,
    IgoErrorModule.forRoot(),
    // IgoLoggingModule.forRoot() // Only if you want register http calls in console
    AppRequestComponent
  ],
  exports: [AppRequestComponent]
})
export class AppRequestModule {}
