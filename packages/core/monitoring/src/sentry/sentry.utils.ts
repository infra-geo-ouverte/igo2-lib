import { BaseUser } from '@igo2/core/user';

import { setUser } from '@sentry/angular';

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
