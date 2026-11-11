import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer
} from '@angular/core';

import {
  PROJECTION_PROVIDER_OPTIONS,
  ProjectionProviderOptions,
  ProjectionService
} from './projection.service';

export function provideProjection(
  options: ProjectionProviderOptions = {}
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PROJECTION_PROVIDER_OPTIONS,
      useValue: options
    },
    provideAppInitializer(() => {
      inject(ProjectionService);
    })
  ]);
}
