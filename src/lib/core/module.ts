import { NgModule, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { SimpleNotificationsModule } from 'angular2-notifications';

import { TranslateModule, MissingTranslationHandler,
         TranslateService } from '@ngx-translate/core';

import { ConfigService, provideConfigLoader , provideConfigOptions} from './config';

import { LanguageService, IgoMissingTranslationHandler,
         provideDefaultLanguageLoader } from './language';

import { ActivityService, ActivityInterceptor } from './activity';
import { MediaService } from './media';
import { ErrorInterceptor } from './request';
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
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ActivityInterceptor,
          multi: true
        },

        MediaService,
        MessageService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        },

        TranslateService,
        LanguageService,
        provideDefaultLanguageLoader()
      ]
    };
  }
}
