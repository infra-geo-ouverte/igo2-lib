import type { MsalGuardConfiguration } from '@azure/msal-angular';
import type { BrowserAuthOptions } from '@azure/msal-browser';

export interface AuthMicrosoftOptions extends BrowserAuthOptions {
  enabled?: boolean;
  applicationId?: string;
  autoLogin?: boolean;
}

export interface AuthMicrosoftb2cOptions {
  enabled?: boolean;
  browserAuthOptions?: BrowserAuthOptions;
  options?: AuthMicrosoftb2cOptionsOptions;
  scopes?: string[];
}

export interface AuthMicrosoftb2cOptionsOptions {
  names: AuthMicrosoftb2cOptionsNames;
  authorities: AuthMicrosoftb2cOptionsAuthorities;
  authorityDomain: string[];
}

export interface AuthMicrosoftb2cOptionsNames {
  signUpSignIn: string;
  forgotPassword: string;
  editProfile: string;
}

export interface AuthMicrosoftb2cOptionsAuthorities {
  signUpSignIn: AuthMicrosoftb2cOptionsAuthority;
  forgotPassword: AuthMicrosoftb2cOptionsAuthority;
  editProfile: AuthMicrosoftb2cOptionsAuthority;
}

export interface AuthMicrosoftb2cOptionsAuthority {
  authority: string;
}

export interface MSPMsalGuardConfiguration extends MsalGuardConfiguration {
  type: string;
}
