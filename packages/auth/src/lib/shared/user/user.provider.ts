import { ConfigService } from '@igo2/core/config';

import {
  AuthFeature,
  AuthFeatureKind,
  IAuthUserIgoOptions
} from '../auth.interface';
import { USER_AUTH_OPTIONS, UserService } from './user.service';

export function withUserIgo(): AuthFeature<AuthFeatureKind.User> {
  return {
    kind: AuthFeatureKind.User,
    providers: [
      {
        provide: USER_AUTH_OPTIONS,
        useFactory: (config: ConfigService) => config.getConfig('auth.user'),
        deps: [ConfigService]
      },
      {
        provide: UserService,
        useFactory: (options: IAuthUserIgoOptions | undefined) => {
          if (!options) {
            return undefined;
          }

          return new UserService();
        },
        deps: [USER_AUTH_OPTIONS]
      }
    ]
  };
}
