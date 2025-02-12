import { EnvironmentProviders, makeEnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

type MaterialSymbolStyle = 'outlined' | 'rounded' | 'sharp';

export function provideIcon(
  style: MaterialSymbolStyle = 'outlined'
): EnvironmentProviders {
  return makeEnvironmentProviders([
    MatIconModule,
    provideAppInitializer(() => {
        const initializerFn = ((iconRegistry: MatIconRegistry) => () =>
        iconRegistry.setDefaultFontSetClass(`material-symbols-${style}`))(inject(MatIconRegistry));
        return initializerFn();
      })
  ]);
}
