import { AuthFacebookComponent } from './auth-facebook/auth-facebook.component';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { AuthGoogleComponent } from './auth-google/auth-google.component';
import { AuthInternComponent } from './auth-intern/auth-intern.component';
import { AuthMicrosoftComponent } from './auth-microsoft/auth-microsoft.component';
import { AuthMicrosoftb2cComponent } from './auth-microsoftb2c/auth-microsoftb2c.component';

/*
 * Public API Surface of auth
 */

export { AuthFormComponent } from './auth-form/auth-form.component';

export * from './shared';
export * from './auth-microsoftb2c/auth-microsoft.provider';
export * from './auth-form.module';

export * from './auth-form/auth-form.component';
export * from './auth-intern/auth-intern.component';
export * from './auth-facebook/auth-facebook.component';
export * from './auth-google/auth-google.component';
export * from './auth-microsoft/auth-microsoft.component';
export * from './auth-microsoftb2c/auth-microsoftb2c.component';

export const AUTH_FORM_DIRECTIVES = [
  AuthFormComponent,
  AuthGoogleComponent,
  AuthInternComponent,
  AuthFacebookComponent,
  AuthMicrosoftComponent,
  AuthMicrosoftb2cComponent
] as const;
