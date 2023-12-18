import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { IgoErrorModule, IgoLanguageModule } from '@igo2/core';

import { SharedModule } from '../../shared/shared.module';
import { AppRequestRoutingModule } from './request-routing.module';
import { AppRequestComponent } from './request.component';

@NgModule({
  imports: [
    AppRequestRoutingModule,
    SharedModule,
    HttpClientModule,
    IgoLanguageModule.forRoot(),
    IgoErrorModule.forRoot(), // Only if you want register errors from http call in console
    // IgoLoggingModule.forRoot() // Only if you want register http calls in console
    AppRequestComponent
  ],
  exports: [AppRequestComponent]
})
export class AppRequestModule {}
