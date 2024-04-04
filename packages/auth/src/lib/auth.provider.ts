import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  EnvironmentProviders,
  Provider,
  makeEnvironmentProviders
} from '@angular/core';

import { AuthStorageService } from '@igo2/auth/form';
import { StorageService } from '@igo2/core/storage';

import { AuthFeature, AuthFeatureKind, AuthInterceptor } from './shared';

export function provideAuthentification(
  ...features: AuthFeature<AuthFeatureKind>[]
): EnvironmentProviders {
  const providers: Provider[] = [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
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
