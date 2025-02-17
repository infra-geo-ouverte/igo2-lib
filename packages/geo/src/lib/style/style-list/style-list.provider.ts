import { InjectionToken, inject, provideAppInitializer } from '@angular/core';

import { StyleListOptions } from './style-list.interface';
import { StyleListService } from './style-list.service';

export const STYLELIST_OPTIONS = new InjectionToken<StyleListOptions>(
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
  return provideAppInitializer(
    styleListFactory(inject(StyleListService), inject(STYLELIST_OPTIONS))
  );
}
