import { setUser } from '@sentry/angular-ivy';
import { SentryMonitoringOptions } from './sentry.interface';
import { BaseUser } from '../../user';

export const isTracingEnabled = (options: SentryMonitoringOptions): boolean =>
  options.enableTracing || !!options.tracesSampleRate || !!options.tracesSampler;

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
