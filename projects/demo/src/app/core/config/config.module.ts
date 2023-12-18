import { NgModule } from '@angular/core';

import { IgoConfigModule, provideConfigOptions } from '@igo2/core';

import { environment } from '../../../environments/environment';

import { AppConfigRoutingModule } from './config-routing.module';
import { AppConfigComponent } from './config.component';

@NgModule({
  imports: [
    AppConfigRoutingModule,
    IgoConfigModule.forRoot(),
    AppConfigComponent
],
  exports: [AppConfigComponent],
  providers: [
    provideConfigOptions({
      default: environment.igo
    })
  ]
})
export class AppConfigModule {}
