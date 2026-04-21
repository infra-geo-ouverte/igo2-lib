import {
  EnvironmentProviders,
  InjectionToken,
  Provider,
  makeEnvironmentProviders
} from '@angular/core';

import { StyleEngineKind } from './shared/style.enum';
import { StyleEngineFeature } from './shared/style.interface';
import { StyleEngine } from './style.service';

export const STYLE_ENGINES = new InjectionToken<StyleEngine[]>('STYLE_ENGINES');

export function provideStyle(
  ...features: StyleEngineFeature<StyleEngineKind>[]
): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [];

  for (const feature of features) {
    providers.push(...feature.providers);
  }

  return makeEnvironmentProviders(providers);
}
