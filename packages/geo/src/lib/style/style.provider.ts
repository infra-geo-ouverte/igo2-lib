import {
  EnvironmentProviders,
  Provider,
  makeEnvironmentProviders
} from '@angular/core';

import { StyleFeature, StyleFeatureKind } from './shared/style.interface';
import { StyleService } from './style-service/style.service';

export function provideStyle(
  ...features: StyleFeature<StyleFeatureKind>[]
): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [
    {
      provide: StyleService,
      useClass: StyleService
    }
  ];

  for (const feature of features) {
    providers.push(...feature.providers);
  }

  return makeEnvironmentProviders(providers);
}
