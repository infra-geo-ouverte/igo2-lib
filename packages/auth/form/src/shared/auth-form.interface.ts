import { AuthFacebookOptions } from '@igo2/auth/facebook';
import { AuthGoogleOptions } from '@igo2/auth/google';
import {
  AuthMicrosoftOptions,
  AuthMicrosoftb2cOptions
} from '@igo2/auth/microsoft';

export type AuthFormOptions = {
  facebook?: AuthFacebookOptions;
  google?: AuthGoogleOptions;
  microsoft?: AuthMicrosoftOptions;
  microsoftb2c?: AuthMicrosoftb2cOptions;
};
