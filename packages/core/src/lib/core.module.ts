import { CommonModule } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { IgoActivityModule } from '@igo2/core/activity';
import { ConfigOptions, provideConfig } from '@igo2/core/config';
import { IgoLanguageModule, provideTranslation } from '@igo2/core/language';
import { provideMessage } from '@igo2/core/message';
import { IgoErrorModule } from '@igo2/core/request';

@NgModule({
  declarations: [],
  exports: [IgoActivityModule, IgoErrorModule, IgoLanguageModule],
  imports: [
    CommonModule,
    IgoActivityModule.forRoot(),
    IgoErrorModule.forRoot()
  ],
  providers: [provideMessage(), provideHttpClient(withInterceptorsFromDi())]
})
export class IgoCoreModule {
  static forRoot(
    options: ConfigOptions = {}
  ): ModuleWithProviders<IgoCoreModule> {
    return {
      ngModule: IgoCoreModule,
      providers: [provideConfig(options), provideTranslation()]
    };
  }
}
