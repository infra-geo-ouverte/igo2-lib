export interface AuthInternOptions {
  enabled?: boolean;
}

export interface AuthFacebookOptions {
  enabled?: boolean;
  apiKey: string;
}

export interface AuthGoogleOptions {
  enabled?: boolean;
  apiKey: string;
  clientId: string;
}

export interface AuthOptions {
  url: string;
  tokenKey: string;
  allowAnonymous?: boolean;
  loginRoute?: string;
  logoutRoute?: string;
  homeRoute?: string;
  intern?: AuthInternOptions;
  facebook?: AuthFacebookOptions;
  google?: AuthGoogleOptions;
  trustHosts?: string[];
  profilsGuard?: string[];
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
