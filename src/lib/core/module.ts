import { NgModule, ModuleWithProviders } from '@angular/core';

import { SimpleNotificationsModule } from 'angular2-notifications';

import { TranslateModule, MissingTranslationHandler,
         TranslateService } from '@ngx-translate/core';

import { ConfigService, provideConfigLoader , provideConfigOptions} from './config';

import { LanguageService, IgoMissingTranslationHandler,
         provideDefaultLanguageLoader } from './language';

import { ActivityService, provideActivityInterceptor } from './activity';
import { MediaService } from './media';
import { provideErrorInterceptor } from './request';
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
        provideActivityInterceptor(),

        MediaService,
        MessageService,
        provideErrorInterceptor(),

        TranslateService,
        LanguageService,
        provideDefaultLanguageLoader()
      ]
    };
  }
}
