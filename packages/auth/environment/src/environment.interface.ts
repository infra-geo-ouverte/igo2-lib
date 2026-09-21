import { AuthOptions, AuthStorageOptions } from '@igo2/auth';
import { AnyMicrosoftOptions } from '@igo2/auth/microsoft';

export type AnyAuthOptions = AuthOptions & AnyMicrosoftOptions;

export interface AuthEnvironmentOptions {
  auth?: AnyAuthOptions;
  storage?: AuthStorageOptions;
}
