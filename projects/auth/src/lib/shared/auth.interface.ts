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
  loginRoute?: string;
  logoutRoute?: string;
  intern?: AuthInternOptions;
  facebook?: AuthFacebookOptions;
  google?: AuthGoogleOptions;
  trustHosts?: string[];
}

export interface User {
  source?: string;
  sourceId?: string;
  email?: string;
  defaultContextId?: string;
}
