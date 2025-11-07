import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer
} from '@angular/core';

import { ConfigOptions } from './config.interface';
import { ConfigService } from './config.service';

export const CONFIG_OPTIONS = new InjectionToken<ConfigOptions>(
  'configOptions'
);

export function provideConfig(options: ConfigOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: CONFIG_OPTIONS,
      useValue: options
    },
    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      const options = inject(CONFIG_OPTIONS);
      return configService.load(options);
    })
  ]);
}
