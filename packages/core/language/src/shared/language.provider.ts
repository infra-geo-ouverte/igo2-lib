import { HttpBackend } from '@angular/common/http';
import {
  DOCUMENT,
  EnvironmentProviders,
  Provider,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer
} from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import {
  Language,
  MissingTranslationHandler,
  TRANSLATE_SERVICE_CONFIG,
  TranslateLoader,
  TranslateModuleConfig,
  TranslateServiceConfig,
  provideTranslateService
} from '@ngx-translate/core';
import { first } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { LanguageLoaderBase, LanguageOptions } from './language.interface';
import {
  LanguageLoader,
  LanguageLoaderWithAsyncConfig
} from './language.loader';
import { LanguageService } from './language.service';
import { IgoMissingTranslationHandler } from './missing-translation.guard';

// 5 seconds
const TIMEOUT_DURATION = 5000;

export interface TranslationFeature<KindT extends TranslationFeatureKind> {
  kind: KindT;
  providers: (Provider | EnvironmentProviders)[];
}

export enum TranslationFeatureKind {
  Translation = 0,
  DefaultLanguage = 1
}

/**
 * Make sure you only call this method in the root module of your application, most of the time called AppModule.
 */
export function provideTranslation(
  featureConfig: TranslationFeature<TranslationFeatureKind.Translation>
): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...featureConfig.providers,
    provideAppInitializer(() => {
      const languageService = inject(LanguageService);
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
    })
  ]);
}

export function withStaticConfig(
  options: LanguageOptions,
  defaultLanguage?: string | undefined
): TranslationFeature<TranslationFeatureKind.Translation> {
  const loader: Provider = {
    provide: TranslateLoader,
    useFactory: (http: HttpBackend) => languageLoaderWithStatic(http, options),
    deps: [HttpBackend]
  };
  return {
    kind: TranslationFeatureKind.Translation,
    providers: [
      provideTranslateService(setTranslationConfig(loader, defaultLanguage))
    ]
  };
}

export function withAsyncConfig(
  defaultLanguage?: string | undefined
): TranslationFeature<TranslationFeatureKind.Translation> {
  const loader: Provider = {
    provide: TranslateLoader,
    useFactory: languageLoaderWithAsync,
    deps: [HttpBackend, ConfigService]
  };
  return {
    kind: TranslationFeatureKind.Translation,
    providers: [
      provideTranslateService(setTranslationConfig(loader, defaultLanguage))
    ]
  };
}

/**
 * Get the first segment of the path (e.g., '/en/alerts' => 'en')
 * @param allowedLanguages default to ['fr', 'en']
 */
export function withUrlDefaultLanguage(
  fallbackLang?: Language,
  allowedLanguages: Language[] = ['fr', 'en']
): TranslationFeature<TranslationFeatureKind.DefaultLanguage> {
  return {
    kind: TranslationFeatureKind.DefaultLanguage,
    providers: [
      {
        provide: TRANSLATE_SERVICE_CONFIG,
        useFactory: defaultLanguageSegmentFactory(
          allowedLanguages,
          fallbackLang
        )
      }
    ]
  };
}

function defaultLanguageSegmentFactory(
  allowedLanguages: Language[],
  fallbackLang?: Language
): () => TranslateServiceConfig {
  return () => {
    const doc = inject(DOCUMENT);
    const url = new URL(doc.location.href);

    const firstSegment = url.pathname.split('/').filter(Boolean)[0];
    if (allowedLanguages.includes(firstSegment)) {
      return {
        extend: true,
        lang: firstSegment
      } satisfies TranslateServiceConfig;
    }

    return {
      extend: true,
      lang: fallbackLang,
      fallbackLang: fallbackLang ?? 'fr'
    } satisfies TranslateServiceConfig;
  };
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

function languageLoaderWithStatic(
  http: HttpBackend,
  options?: LanguageOptions
) {
  return new LanguageLoader(http, options);
}

export const LANGUAGE_LOADER: Provider = {
  provide: TranslateLoader,
  useFactory: languageLoaderWithAsync,
  deps: [HttpBackend, ConfigService]
};

function languageLoaderWithAsync(http: HttpBackend, config?: ConfigService) {
  return new LanguageLoaderWithAsyncConfig(http, config, undefined, undefined);
}

export const DEFAULT_LANGUAGE_LOADER: Provider = {
  provide: TranslateLoader,
  useFactory: languageLoaderWithAsync,
  deps: [HttpBackend, ConfigService]
};
