import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { IgoConfigModule, provideConfigOptions } from '@igo2/core';

import { environment } from '../../../environments/environment';
import { AppConfigComponent } from './config.component';
import { AppConfigRoutingModule } from './config-routing.module';

@NgModule({
  declarations: [AppConfigComponent],
  imports: [
    AppConfigRoutingModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    IgoConfigModule.forRoot()
  ],
  exports: [AppConfigComponent],
  providers: [
    provideConfigOptions({
      default: environment.igo
    })
  ]
})
export class AppConfigModule {}
