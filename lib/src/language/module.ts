import { NgModule, ModuleWithProviders } from '@angular/core';

import { TranslateModule, MissingTranslationHandler,
  TranslateService } from '@ngx-translate/core';


import { LanguageService, IgoMissingTranslationHandler } from './shared';

@NgModule({
  imports: [
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: IgoMissingTranslationHandler
      }
    })
  ],
  exports: []
})
export class IgoLanguageModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoLanguageModule,
      providers: [
        TranslateService,
        LanguageService
      ]
    };
  }
}

export * from './shared';
