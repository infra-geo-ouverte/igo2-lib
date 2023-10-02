import { ModuleWithProviders, NgModule } from '@angular/core';

import {
  MissingTranslationHandler,
  TranslateModule
} from '@ngx-translate/core';

import { provideDefaultLanguageLoader } from './shared/language.provider';
import { IgoMissingTranslationHandler } from './shared/missing-translation.guard';

@NgModule({
  imports: [
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
export class IgoLanguageModule {
  static forRoot(): ModuleWithProviders<IgoLanguageModule> {
    return {
      ngModule: IgoLanguageModule,
      providers: [provideDefaultLanguageLoader()]
    };
  }
}
