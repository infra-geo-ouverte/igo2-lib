import { HttpBackend } from '@angular/common/http';
import {
  APP_INITIALIZER,
  EnvironmentProviders,
  Provider,
  importProvidersFrom,
  makeEnvironmentProviders
} from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import {
  MissingTranslationHandler,
  TranslateLoader,
  TranslateModule,
  TranslateModuleConfig
} from '@ngx-translate/core';
import { first } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { LanguageLoaderBase } from './language.interface';
import { LanguageLoader } from './language.loader';
import { LanguageService } from './language.service';
import { IgoMissingTranslationHandler } from './missing-translation.guard';

// 5 seconds
const TIMEOUT_DURATION = 5000;

/**
 * Make sure you only call this method in the root module of your application, most of the time called AppModule.
 */
export function provideTranslation(
  defaultLanguage?: string | undefined,
  loader?: Provider
): EnvironmentProviders {
  return makeEnvironmentProviders([
    importProvidersFrom(
      TranslateModule.forRoot(setTranslationConfig(loader, defaultLanguage))
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: (languageService: LanguageService) => () => {
        return (
          languageService.translate.currentLoader as LanguageLoaderBase
        ).isLoaded$?.pipe(
          timeout(TIMEOUT_DURATION),
          first((isLoaded) => isLoaded === true),
          catchError((error) => {
            error.message += ` - Request timed out for language loader after: ${TIMEOUT_DURATION}`;
            throw error;
          })
        );
      },
      deps: [LanguageService],
      multi: true
    }
  ]);
}

export const setTranslationConfig = (
  loader?: Provider,
  defaultLanguage?: string
): TranslateModuleConfig => ({
  defaultLanguage: defaultLanguage,
  loader: loader ?? DEFAULT_LANGUAGE_LOADER,
  missingTranslationHandler: {
    provide: MissingTranslationHandler,
    useClass: IgoMissingTranslationHandler
  }
});

export const DEFAULT_LANGUAGE_LOADER: Provider = {
  provide: TranslateLoader,
  useFactory: defaultLanguageLoader,
  deps: [HttpBackend, ConfigService]
};

function defaultLanguageLoader(http: HttpBackend, config?: ConfigService) {
  return new LanguageLoader(http, config, undefined, undefined);
}
