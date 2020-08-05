import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { IgoErrorModule, IgoLanguageModule } from '@igo2/core';

import { AppRequestComponent } from './request.component';
import { AppRequestRoutingModule } from './request-routing.module';

@NgModule({
  declarations: [AppRequestComponent],
  imports: [
    AppRequestRoutingModule,
    MatCardModule,
    MatButtonModule,
    HttpClientModule,
    IgoLanguageModule.forRoot(),
    IgoErrorModule.forRoot() // Only if you want register errors from http call in console
    // IgoLoggingModule.forRoot() // Only if you want register http calls in console
  ],
  exports: [AppRequestComponent]
})
export class AppRequestModule {}
