import { AuthOptions, AuthStorageOptions } from '../shared';

export interface EnvironmentOptions {
  auth?: AuthOptions;
  storage?: AuthStorageOptions;
}
