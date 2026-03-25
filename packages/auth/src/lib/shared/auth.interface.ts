import { Provider } from '@angular/core';

import { BaseUser } from '@igo2/core/user';

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

export interface AuthByKeyOptions {
  domainRegFilters?: string;
  keyProperty?: string;
  keyValue?: string;
}
export interface WithCredentialsOptions {
  withCredentials?: boolean;
  domainRegFilters?: string;
}

export interface User extends BaseUser {
  source?: string;
  sourceId?: string;
  locale?: string;
  isExpired?: boolean;
  isAdmin?: boolean;
  defaultContextId?: string;
}

export interface IInfosUser {
  tokenId: string;
}

export interface AuthOptions {
  url: string;
  /** User api url is the igo user versus the url is the authentification API */
  user?: IAuthUserIgoOptions;
  tokenKey?: string;
  allowAnonymous?: boolean;
  loginRoute?: string;
  logoutRedirectRoute?: string;
  logoutRoute?: string;
  homeRoute?: string;
  trustHosts?: string[];
  profilsGuard?: string[];
  hostsWithCredentials?: WithCredentialsOptions[];
  hostsByKey?: AuthByKeyOptions[];
  intern?: AuthInternOptions;
}

export interface IAuthUserIgoOptions {
  apiUrl: string;
  // Allow to sync the user. Use it when the user may not exist on the user API system.
  withSync?: boolean;
}

export interface AuthByKeyOptions {
  domainRegFilters?: string;
  keyProperty?: string;
  keyValue?: string;
}
export interface WithCredentialsOptions {
  withCredentials?: boolean;
  domainRegFilters?: string;
}

export interface AuthInternOptions {
  enabled?: boolean;
}

export interface AuthFeature<KindT extends AuthFeatureKind> {
  kind: KindT;
  providers: Provider[];
}

export enum AuthFeatureKind {
  Microsoft = 0,
  User
}
