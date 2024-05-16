import {
  APP_INITIALIZER,
  EnvironmentProviders,
  makeEnvironmentProviders
} from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

type MaterialSymbolStyle = 'outlined' | 'rounded' | 'sharp';

export function provideIcon(
  style: MaterialSymbolStyle = 'outlined'
): EnvironmentProviders {
  return makeEnvironmentProviders([
    MatIconModule,
    {
      provide: APP_INITIALIZER,
      useFactory: (iconRegistry: MatIconRegistry) => () =>
        iconRegistry.setDefaultFontSetClass(`material-symbols-${style}`),
      deps: [MatIconRegistry],
      multi: true
    }
  ]);
}
