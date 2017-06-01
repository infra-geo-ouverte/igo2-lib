import { NgModule, ModuleWithProviders } from '@angular/core';

import { SimpleNotificationsModule } from 'angular2-notifications';

import { TranslateModule, MissingTranslationHandler,
         TranslateService } from '@ngx-translate/core';

import { ConfigService, provideConfigLoader , provideConfigOptions} from './config';

import { LanguageService, IgoMissingTranslationHandler,
         provideLanguageLoader } from './language';

import { ActivityService } from './activity';
import { MediaService } from './media';
import { RequestService } from './request';
import { MessageCenterComponent, MessageService } from './message';


@NgModule({
  imports: [
    SimpleNotificationsModule.forRoot(),
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: IgoMissingTranslationHandler
      }
    })
  ],
  declarations: [
    MessageCenterComponent
  ],
  exports: [
    MessageCenterComponent
  ]
})
export class IgoCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCoreModule,
      providers: [
        ConfigService,
        provideConfigOptions({}),
        provideConfigLoader(),

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
