import { AuthFacebookComponent } from './auth-facebook.component';
import { AuthFormComponent } from './auth-form.component';
import { AuthGoogleComponent } from './auth-google.component';
import { AuthInternComponent } from './auth-intern.component';
import { AuthMicrosoftComponent } from './auth-microsoft.component';
import { AuthMicrosoftb2cComponent } from './auth-microsoftb2c.component';

export * from './auth-form.component';
export * from './auth-intern.component';
export * from './auth-facebook.component';
export * from './auth-google.component';

export const AUTH_FORM_DIRECTIVES = [
  AuthFormComponent,
  AuthGoogleComponent,
  AuthInternComponent,
  AuthFacebookComponent,
  AuthMicrosoftComponent,
  AuthMicrosoftb2cComponent
] as const;
