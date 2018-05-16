import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import {
  TranslateModule,
  MissingTranslationHandler
} from '@ngx-translate/core';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { ActivityInterceptor } from './activity';
import { provideConfigOptions, provideConfigLoader } from './config';
import { provideDefaultLanguageLoader } from './language/shared';
import { IgoMissingTranslationHandler } from './language/shared/missing-translation.guard';
import { MessageCenterComponent } from './message/message-center/message-center.component';
import { ErrorInterceptor } from './request';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    SimpleNotificationsModule.forRoot(),
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: IgoMissingTranslationHandler
      }
    })
  ],
  declarations: [MessageCenterComponent],
  exports: [CommonModule, TranslateModule]
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
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        },
        provideConfigOptions({}),
        provideConfigLoader(),
        provideDefaultLanguageLoader()
      ]
    };
  }
}
