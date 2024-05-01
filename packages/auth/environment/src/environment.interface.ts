import { AuthOptions, AuthStorageOptions } from '@igo2/auth';
import { AuthFormOptions } from '@igo2/auth/form';

export interface AuthEnvironmentOptions {
  auth?: AuthOptions & AuthFormOptions;
  storage?: AuthStorageOptions;
}
