import { APP_INITIALIZER, InjectionToken } from '@angular/core';

import { StyleListService } from './style-list.service';
import { StyleListOptions } from './style-list.interface';

export let STYLELIST_OPTIONS = new InjectionToken<StyleListOptions>(
  'styleListOptions'
);

export function provideStyleListOptions(options: StyleListOptions) {
  return {
    provide: STYLELIST_OPTIONS,
    useValue: options
  };
}

export function styleListFactory(
  styleListService: StyleListService,
  options: StyleListOptions
) {
  return () => styleListService.load(options);
}

export function provideStyleListLoader() {
  return {
    provide: APP_INITIALIZER,
    useFactory: styleListFactory,
    multi: true,
    deps: [StyleListService, STYLELIST_OPTIONS]
  };
}
