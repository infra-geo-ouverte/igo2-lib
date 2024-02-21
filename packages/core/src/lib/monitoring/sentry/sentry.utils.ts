import { setUser } from '@sentry/angular-ivy';

import { BaseUser } from '../../user';
import { SentryMonitoringOptions } from './sentry.interface';

export const isTracingEnabled = (options: SentryMonitoringOptions): boolean =>
  options.enableTracing ||
  !!options.tracesSampleRate ||
  !!options.tracesSampler;

export const identifySentryUser = (user: BaseUser | null): void => {
  setUser(
    user
      ? {
          id: user.id,
          username: `${user.firstName} ${user.lastName}`,
          email: user.email
        }
      : null
  );
};
