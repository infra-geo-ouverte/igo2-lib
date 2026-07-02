import {
  EnvironmentProviders,
  inject,
  provideAppInitializer
} from '@angular/core';

import { ToastConfig, ToastService } from './toast';

/**
 * Provides the message service with custom toast configuration.
 * Since ToastService is providedIn: 'root', this simply configures it.
 */
export function provideMessage(
  config?: Partial<ToastConfig>
): EnvironmentProviders {
  return provideAppInitializer(() => {
    if (!config) {
      return;
    }
    inject(ToastService).configure(config);
  });
}
