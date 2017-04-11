import { NgModule, ModuleWithProviders } from '@angular/core';
import { MissingTranslationHandler } from 'ng2-translate';

import { LanguageService, IgoMissingTranslationHandler } from './shared';


@NgModule({
  imports: [],
  exports: []
})
export class IgoLanguageModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoLanguageModule,
      providers: [
        LanguageService,
        {
          provide: MissingTranslationHandler,
          useClass: IgoMissingTranslationHandler
        }
      ]
    };
  }
}

export * from './shared';
