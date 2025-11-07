import { Provider } from '@angular/core';

import { BaseUser } from '@igo2/core/user';

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
  url?: string;
  tokenKey?: string;
  allowAnonymous?: boolean;
  loginRoute?: string;
  logoutRoute?: string;
  homeRoute?: string;
  trustHosts?: string[];
  profilsGuard?: string[];
  hostsWithCredentials?: WithCredentialsOptions[];
  hostsByKey?: AuthByKeyOptions[];
  intern?: AuthInternOptions;
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
  Microsoft = 0
}
