import {
  AUTH_OPTIONS,
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
        useFactory: (authOptions: { user?: IAuthUserIgoOptions }) =>
          authOptions.user,
        deps: [AUTH_OPTIONS]
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
