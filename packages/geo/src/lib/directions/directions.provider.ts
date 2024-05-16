import { Provider } from '@angular/core';

import {
  DirectionSourceFeature,
  DirectionSourceKind
} from './directions-sources';
import { DirectionsService } from './shared';
import { provideDirectionsSourceService } from './shared/directions-source.service';

export function provideDirection(
  ...sources: DirectionSourceFeature<DirectionSourceKind>[]
): Provider[] {
  const providers: Provider[] = [
    {
      provide: DirectionsService,
      useClass: DirectionsService
    },
    provideDirectionsSourceService()
  ];

  for (const source of sources) {
    providers.push(...source.providers);
  }

  return providers;
}
