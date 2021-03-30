import { BrowserAuthOptions } from '@azure/msal-browser';

export interface AuthInternOptions {
  enabled?: boolean;
}

export interface AuthFacebookOptions {
  enabled?: boolean;
  appId: string;
}

export interface AuthGoogleOptions {
  enabled?: boolean;
  apiKey: string;
  clientId: string;
}

export interface AuthMicrosoftOptions {
  enabled?: boolean;
  clientId: string;
  redirectUri?: string;
  authority?: string;
}

export interface AuthMicrosoftb2cOptions {
  enabled?: boolean;
  browserAuthOptions?: BrowserAuthOptions;
  options?: AuthMicrosoftb2cOptionsOptions;
  scopes?: string[];
}

export interface AuthMicrosoftb2cOptionsOptions {
  names: authMicrosoftb2cOptionsNames;
  authorities: authMicrosoftb2cOptionsAuthorities;
  authorityDomain: string[];
}

export interface authMicrosoftb2cOptionsNames {
  signUpSignIn: string;
  forgotPassword: string;
  editProfile: string;
}

export interface authMicrosoftb2cOptionsAuthorities {
  signUpSignIn: authMicrosoftb2cOptionsAuthority;
  forgotPassword: authMicrosoftb2cOptionsAuthority;
  editProfile: authMicrosoftb2cOptionsAuthority;
}

export interface authMicrosoftb2cOptionsAuthority {
  authority: string;
}

export interface AuthOptions {
  url?: string;
  tokenKey: string;
  allowAnonymous?: boolean;
  loginRoute?: string;
  logoutRoute?: string;
  homeRoute?: string;
  intern?: AuthInternOptions;
  facebook?: AuthFacebookOptions;
  google?: AuthGoogleOptions;
  microsoft?: AuthMicrosoftOptions;
  microsoftb2c?: AuthMicrosoftb2cOptions
  trustHosts?: string[];
  profilsGuard?: string[];
  hostsWithCredentials?: WithCredentialsOptions[];
}
export interface WithCredentialsOptions {
  withCredentials?: boolean;
  domainRegFilters?: string;
 }

export interface User {
  source?: string;
  sourceId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  locale?: string;
  isExpired?: boolean;
  admin?: boolean;
  defaultContextId?: string;
}
