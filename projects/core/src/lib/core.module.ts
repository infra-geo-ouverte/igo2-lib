import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import {
  TranslateModule,
  MissingTranslationHandler
} from '@ngx-translate/core';

import { ActivityInterceptor } from './activity';
import { provideConfigOptions, provideConfigLoader } from './config';
import { provideDefaultLanguageLoader } from './language/shared';
import { IgoMissingTranslationHandler } from './language/shared/missing-translation.guard';

@NgModule({
  imports: [
    HttpClientModule,
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: IgoMissingTranslationHandler
      }
    })
  ],
  declarations: [],
  exports: [TranslateModule]
})
export class IgoCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCoreModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ActivityInterceptor,
          multi: true
        },
        provideConfigOptions({}),
        provideConfigLoader(),
        provideDefaultLanguageLoader()
      ]
    };
  }
}
