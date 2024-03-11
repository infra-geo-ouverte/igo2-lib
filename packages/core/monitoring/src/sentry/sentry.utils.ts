import { BaseUser } from '@igo2/core/user';

import { setUser } from '@sentry/angular-ivy';

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
