import { NgModule, ModuleWithProviders } from '@angular/core';

import { TranslateModule, MissingTranslationHandler,
         TranslateService } from '@ngx-translate/core';

import { LanguageService, IgoMissingTranslationHandler,
         provideLanguageLoader } from './language';

import { ActivityService } from './activity';
import { MediaService } from './media';
import { RequestService } from './request';
import { MessageService } from './message';


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
export class IgoCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCoreModule,
      providers: [
        ActivityService,
        MediaService,
        MessageService,
        RequestService,

        TranslateService,
        LanguageService,
        provideLanguageLoader()
      ]
    };
  }
}
