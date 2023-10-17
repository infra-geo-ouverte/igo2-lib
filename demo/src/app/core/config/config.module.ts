import { NgModule } from '@angular/core';

import { IgoConfigModule, provideConfigOptions } from '@igo2/core';

import { environment } from '../../../environments/environment';
import { SharedModule } from '../../shared/shared.module';
import { AppConfigRoutingModule } from './config-routing.module';
import { AppConfigComponent } from './config.component';

@NgModule({
  declarations: [AppConfigComponent],
  imports: [AppConfigRoutingModule, SharedModule, IgoConfigModule.forRoot()],
  exports: [AppConfigComponent],
  providers: [
    provideConfigOptions({
      default: environment.igo
    })
  ]
})
export class AppConfigModule {}
