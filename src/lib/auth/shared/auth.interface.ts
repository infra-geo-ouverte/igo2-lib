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
  intern?: AuthInternOptions;
  facebook?: AuthFacebookOptions;
  google?: AuthGoogleOptions;
}
