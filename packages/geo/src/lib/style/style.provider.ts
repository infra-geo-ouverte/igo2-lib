import {
  EnvironmentProviders,
  Provider,
  makeEnvironmentProviders
} from '@angular/core';

import { StyleFeature, StyleFeatureKind } from './shared/style.interface';

export function provideStyle(
  ...features: StyleFeature<StyleFeatureKind>[]
): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [];

  if (!features.length) {
    console.warn('You must at least provide 1 provider.');
  }

  for (const feature of features) {
    providers.push(...feature.providers);
  }

  return makeEnvironmentProviders(providers);
}
