import {
  AuthMicrosoftOptions,
  AuthMicrosoftb2cOptions
} from '@igo2/auth/microsoft';

export interface AuthFormOptions {
  microsoft?: AuthMicrosoftOptions;
  microsoftb2c?: AuthMicrosoftb2cOptions;
}
