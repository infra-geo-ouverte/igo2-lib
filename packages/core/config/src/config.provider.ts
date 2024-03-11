import { APP_INITIALIZER, InjectionToken } from '@angular/core';

import { ConfigOptions } from './config.interface';
import { ConfigService } from './config.service';

export let CONFIG_OPTIONS = new InjectionToken<ConfigOptions>('configOptions');

export function provideConfigOptions(options: ConfigOptions) {
  return {
    provide: CONFIG_OPTIONS,
    useValue: options
  };
}

export function configFactory(
  configService: ConfigService,
  options: ConfigOptions
) {
  return () => configService.load(options);
}

export function provideConfigLoader() {
  return {
    provide: APP_INITIALIZER,
    useFactory: configFactory,
    multi: true,
    deps: [ConfigService, CONFIG_OPTIONS]
  };
}
