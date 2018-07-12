import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { provideConfigOptions, provideConfigLoader } from './config';
import { IgoErrorModule } from './request/error.module';

import { IgoActivityModule } from './activity/activity.module';
import { IgoLanguageModule } from './language/language.module';
import { IgoMessageModule } from './message/message.module';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  declarations: [],
  exports: [
    CommonModule,
    IgoActivityModule,
    IgoErrorModule,
    IgoLanguageModule,
    IgoMessageModule
  ]
})
export class IgoCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCoreModule,
      providers: [provideConfigOptions({}), provideConfigLoader()]
    };
  }
}
