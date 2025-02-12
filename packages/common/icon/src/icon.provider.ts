import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer
} from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

type MaterialSymbolStyle = 'outlined' | 'rounded' | 'sharp';

export function provideIcon(
  style: MaterialSymbolStyle = 'outlined'
): EnvironmentProviders {
  return makeEnvironmentProviders([
    MatIconModule,
    provideAppInitializer(() => {
      const initializerFn = () => {
        const iconRegistry = inject(MatIconRegistry);
        iconRegistry.setDefaultFontSetClass(`material-symbols-${style}`);
        return;
      };

      return initializerFn();
    })
  ]);
}
