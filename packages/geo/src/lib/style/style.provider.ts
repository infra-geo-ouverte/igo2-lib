import {
  EnvironmentProviders,
  InjectionToken,
  Provider,
  makeEnvironmentProviders
} from '@angular/core';

import { StyleEngine } from './shared/style-engine.interface';
import { StyleEngineKind } from './shared/style.enum';
import { StyleEngineFeature } from './shared/style.interface';

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
