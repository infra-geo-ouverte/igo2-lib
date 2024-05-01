import {
  APP_INITIALIZER,
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders
} from '@angular/core';

import { ConfigOptions } from './config.interface';
import { ConfigService } from './config.service';

export let CONFIG_OPTIONS = new InjectionToken<ConfigOptions>('configOptions');

export function provideConfig(options: ConfigOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: CONFIG_OPTIONS,
      useValue: options
    },
    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      multi: true,
      deps: [ConfigService, CONFIG_OPTIONS]
    }
  ]);
}

function configFactory(configService: ConfigService, options: ConfigOptions) {
  return () => configService.load(options);
}
