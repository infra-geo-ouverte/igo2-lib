import { AuthOptions } from '@igo2/auth';
import { AuthFormOptions, AuthStorageOptions } from '@igo2/auth/form';

export interface AuthEnvironmentOptions {
  auth?: AuthOptions & AuthFormOptions;
  storage?: AuthStorageOptions;
}
