import { ɵHTTP_ROOT_INTERCEPTOR_FNS as HTTP_ROOT_INTERCEPTOR_FNS } from '@angular/common/http';
import {
  EnvironmentProviders,
  Provider,
  inject,
  makeEnvironmentProviders
} from '@angular/core';

import { XHR_INTERCEPTOR } from '@igo2/core/auth';
import { ConfigService } from '@igo2/core/config';
import { StorageService } from '@igo2/core/storage';

import {
  AUTH_OPTIONS,
  AuthFeature,
  AuthFeatureKind,
  AuthInterceptor,
  AuthOptions,
  AuthStorageService,
  authInterceptorFn
} from './shared';

export function provideAuthentification(
  options?: Partial<AuthOptions>,
  ...features: AuthFeature<AuthFeatureKind>[]
): EnvironmentProviders {
  const providers: Provider[] = [
    {
      provide: AUTH_OPTIONS,
      useFactory: () => resolveAuthOptions(options)
    },
    {
      provide: HTTP_ROOT_INTERCEPTOR_FNS,
      useValue: authInterceptorFn,
      multi: true
    },
    {
      provide: XHR_INTERCEPTOR,
      useExisting: AuthInterceptor
    },
    {
      provide: StorageService,
      useClass: AuthStorageService
    }
  ];

  for (const feature of features) {
    providers.push(...feature.providers);
  }

  return makeEnvironmentProviders(providers);
}

/**
 * Merges options passed explicitly via `withOptions` with the `auth`
 * config entry, when a `ConfigService` is available. Explicit options take
 * precedence over config values.
 */
function resolveAuthOptions(
  explicitOptions?: Partial<AuthOptions>
): AuthOptions {
  const config = inject(ConfigService, { optional: true });
  const configOptions = config?.getConfig<Partial<AuthOptions>>('auth');
  return { ...configOptions, ...explicitOptions };
}
