import { HttpBackend } from '@angular/common/http';
import {
  APP_INITIALIZER,
  EnvironmentProviders,
  Provider,
  importProvidersFrom,
  makeEnvironmentProviders
} from '@angular/core';

import {
  MissingTranslationHandler,
  TranslateLoader,
  TranslateModule,
  TranslateModuleConfig
} from '@ngx-translate/core';

import { ConfigService } from '../../config';
import { LanguageLoader } from './language.loader';
import { LanguageService } from './language.service';
import { IgoMissingTranslationHandler } from './missing-translation.guard';

/**
 * Make sure you only call this method in the root module of your application, most of the time called AppModule.
 */
export function provideRootTranslation(
  loader?: Provider
): EnvironmentProviders {
  return makeEnvironmentProviders([
    importProvidersFrom(TranslateModule.forRoot(setTranslationConfig(loader))),
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [LanguageService],
      multi: true
    }
  ]);
}

export const setTranslationConfig = (
  loader?: Provider
): TranslateModuleConfig => ({
  defaultLanguage: 'en',
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
  return new LanguageLoader(http, undefined, undefined, config);
}
